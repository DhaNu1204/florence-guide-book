#!/usr/bin/env node
/**
 * translate-agent.js
 *
 * Translates en.json into any of the 17 target language files.
 * Uses the Anthropic Messages API (Claude) for translation, processing
 * one chapter at a time to stay within context/token limits.
 *
 * Usage:
 *   node translate-agent.js <lang>         Translate one language (e.g. "it")
 *   node translate-agent.js --all          Translate all 17 languages
 *   node translate-agent.js --validate     Validate all files against en.json
 *   node translate-agent.js --list         Show languages and file status
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY      Required for translation
 *   TRANSLATE_MODEL        Model ID (default: claude-sonnet-4-5-20250929)
 *   TRANSLATE_DELAY_MS     Delay between API calls in ms (default: 1500)
 *   TRANSLATE_MAX_RETRIES  Retry count on failure (default: 2)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────
const CONTENT_DIR = path.join(__dirname, 'src', 'data', 'content');
const EN_PATH = path.join(CONTENT_DIR, 'en.json');

// ── API Config ─────────────────────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.TRANSLATE_MODEL || 'claude-sonnet-4-5-20250929';
const DELAY_MS = parseInt(process.env.TRANSLATE_DELAY_MS || '1500', 10);
const MAX_RETRIES = parseInt(process.env.TRANSLATE_MAX_RETRIES || '2', 10);
const API_URL = 'https://api.anthropic.com/v1/messages';

// ── 17 Target Languages ───────────────────────────────────────
const LANGUAGES = {
  it: { name: 'Italian',              nativeName: 'Italiano',    dir: 'ltr', florence: 'Firenze' },
  es: { name: 'Spanish',              nativeName: 'Español',     dir: 'ltr', florence: 'Florencia' },
  fr: { name: 'French',               nativeName: 'Français',    dir: 'ltr', florence: 'Florence' },
  pt: { name: 'Portuguese',           nativeName: 'Português',   dir: 'ltr', florence: 'Florença' },
  de: { name: 'German',               nativeName: 'Deutsch',     dir: 'ltr', florence: 'Florenz' },
  nl: { name: 'Dutch',                nativeName: 'Nederlands',  dir: 'ltr', florence: 'Florence' },
  sv: { name: 'Swedish',              nativeName: 'Svenska',     dir: 'ltr', florence: 'Florens' },
  da: { name: 'Danish',               nativeName: 'Dansk',       dir: 'ltr', florence: 'Firenze' },
  no: { name: 'Norwegian',            nativeName: 'Norsk',       dir: 'ltr', florence: 'Firenze' },
  ru: { name: 'Russian',              nativeName: 'Русский',     dir: 'ltr', florence: 'Флоренция' },
  pl: { name: 'Polish',               nativeName: 'Polski',      dir: 'ltr', florence: 'Florencja' },
  tr: { name: 'Turkish',              nativeName: 'Türkçe',      dir: 'ltr', florence: 'Floransa' },
  zh: { name: 'Chinese (Simplified)', nativeName: '中文',         dir: 'ltr', florence: '佛罗伦萨' },
  ja: { name: 'Japanese',             nativeName: '日本語',       dir: 'ltr', florence: 'フィレンツェ' },
  ko: { name: 'Korean',               nativeName: '한국어',       dir: 'ltr', florence: '피렌체' },
  ar: { name: 'Arabic',               nativeName: 'العربية',     dir: 'rtl', florence: 'فلورنسا' },
  hi: { name: 'Hindi',                nativeName: 'हिन्दी',       dir: 'ltr', florence: 'फ्लोरेंस' },
};

// ── Helpers ─────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function logError(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.error(`[${ts}] ERROR: ${msg}`);
}

/**
 * Extract a JSON object or array from text that may contain markdown
 * fences, preamble, or trailing commentary.
 */
function extractJSON(text) {
  // 1. Direct parse
  try { return JSON.parse(text.trim()); } catch { /* continue */ }

  // 2. Strip markdown code fences
  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* continue */ }
  }

  // 3. Find outermost { … } by brace-depth counting (string-aware)
  const start = text.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inString = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        // skip escaped characters inside strings
        if (ch === '\\') { i++; continue; }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { break; }
      }
    }
  }

  // 4. Try to repair unescaped quotes inside JSON string values
  if (start >= 0) {
    let candidate = text.slice(start);
    const lastBrace = candidate.lastIndexOf('}');
    if (lastBrace >= 0) {
      candidate = candidate.slice(0, lastBrace + 1);
      // remove trailing commas before } or ]
      candidate = candidate.replace(/,\s*([\]}])/g, '$1');

      const repaired = repairJSON(candidate);
      if (repaired) {
        try { return JSON.parse(repaired); } catch { /* continue */ }
      }
    }
  }

  // Save debug output on failure
  const debugPath = path.join(__dirname, 'debug-response.txt');
  fs.writeFileSync(debugPath, text, 'utf8');
  throw new Error(`Could not extract valid JSON from API response (saved to ${debugPath}, ${text.length} chars)`);
}

/**
 * Known JSON keys in our chapter/UI schema — used to distinguish
 * real string terminators from unescaped quotes inside values.
 */
const KNOWN_KEYS = new Set(['id','number','title','icon','content','sections']);

/**
 * Attempt to repair JSON with unescaped double-quotes inside string values.
 * Uses context-aware heuristics: after a `"`, checks if what follows looks
 * like JSON structure (key-value pair, array element, closing bracket) or
 * if the `"` is just an unescaped quote inside a string value.
 */
function repairJSON(text) {
  const result = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    if (ch === '"') {
      // Start of a JSON string — find its proper end
      result.push('"');
      i++;
      while (i < len) {
        const c = text[i];
        if (c === '\\') {
          // Escaped character — keep both
          result.push(c);
          i++;
          if (i < len) { result.push(text[i]); i++; }
          continue;
        }
        if (c === '"') {
          // Is this the real end of the string?
          // Look ahead with context-aware heuristic
          if (isStringTerminator(text, i)) {
            result.push('"');
            i++;
            break;
          } else {
            // This " is inside the string — escape it
            result.push('\\"');
            i++;
            continue;
          }
        }
        // Literal newlines in strings (invalid JSON) — escape them
        if (c === '\n' || c === '\r') {
          result.push(c === '\n' ? '\\n' : '\\r');
          i++;
          continue;
        }
        result.push(c);
        i++;
      }
    } else {
      result.push(ch);
      i++;
    }
  }

  return result.join('');
}

/**
 * Determine if the `"` at position `pos` is a real JSON string terminator
 * or an unescaped quote inside a string value.
 */
function isStringTerminator(text, pos) {
  const len = text.length;
  // Skip whitespace after the "
  let j = pos + 1;
  while (j < len && (text[j] === ' ' || text[j] === '\t' || text[j] === '\r' || text[j] === '\n')) j++;

  if (j >= len) return true; // end of text

  const after = text[j];

  // Definite terminators: after a closing ", we see } ] or :
  if (after === '}' || after === ']' || after === ':') return true;

  // After a closing ", we might see ","
  if (after === ',') {
    // Skip whitespace after the comma
    let k = j + 1;
    while (k < len && (text[k] === ' ' || text[k] === '\t' || text[k] === '\r' || text[k] === '\n')) k++;

    if (k >= len) return true;

    const afterComma = text[k];

    // After ",", valid JSON has: " (next key/value), { (object), [ (array), ] (end array), } (end object), or a number/boolean/null
    if (afterComma === '{' || afterComma === '[' || afterComma === ']' || afterComma === '}') return true;
    if (/[0-9tfn]/.test(afterComma)) return true; // number, true, false, null

    if (afterComma === '"') {
      // Could be "value", "nextKey": ... — check if this looks like a key-value pair
      // Find the end of the next string
      let m = k + 1;
      let key = '';
      while (m < len && text[m] !== '"' && text[m] !== '\n') {
        if (text[m] === '\\') { m += 2; continue; }
        key += text[m];
        m++;
      }
      if (m < len && text[m] === '"') {
        // Skip whitespace after the closing "
        let n = m + 1;
        while (n < len && (text[n] === ' ' || text[n] === '\t')) n++;
        if (n < len && text[n] === ':') {
          // This looks like "key": ... — so the original " IS a string terminator
          return true;
        }
        // No colon — but if the key is a known schema key, it's still a terminator
        if (KNOWN_KEYS.has(key)) return true;
      }
      // The next " doesn't look like a key — could be another string value in an array
      // Check if key is short and alphanumeric (likely a key name)
      if (key.length < 30 && /^[a-zA-Z_-]+$/.test(key)) return true;

      // Otherwise, this comma-quote is probably inside the string content
      return false;
    }

    // After ",", if we see something that doesn't look like JSON, the " is inside the string
    return false;
  }

  // Anything else after " means it's inside the string
  return false;
}

// ── Anthropic Messages API call with retry ──────────────────────
async function callClaude(systemPrompt, userPrompt, maxTokens = 8192) {
  if (!API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Export it before running:\n' +
      '  export ANTHROPIC_API_KEY=sk-ant-...\n' +
      '  node translate-agent.js <lang>'
    );
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (res.status === 429 || res.status === 529) {
        const wait = Math.min(30000, DELAY_MS * 2 ** (attempt + 1));
        log(`  Rate limited (${res.status}), waiting ${wait / 1000}s…`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = await res.json();

      // Check for truncation
      if (data.stop_reason === 'max_tokens') {
        log('  ⚠ Response was truncated (max_tokens). Retrying with higher limit…');
        maxTokens = Math.min(maxTokens * 2, 16384);
        continue;
      }

      const text = data.content?.[0]?.text;
      if (!text) throw new Error('Empty response from API');
      return text;

    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const wait = DELAY_MS * 2 ** attempt;
        log(`  Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${wait / 1000}s…`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

// ── Translate: UI strings ───────────────────────────────────────
async function translateUI(enUI, langCode, langInfo) {
  const system = [
    `You are a professional translator. Translate JSON string values from English to ${langInfo.name} (${langInfo.nativeName}).`,
    'Return ONLY a valid JSON object — no markdown fences, no explanation, no commentary.',
  ].join(' ');

  const user = `Translate every value in this JSON object to ${langInfo.name} (${langInfo.nativeName}).
Keep all keys exactly as-is. Only translate the string values.
"Florence" → "${langInfo.florence}".

${JSON.stringify(enUI, null, 2)}`;

  const raw = await callClaude(system, user, 2048);
  return extractJSON(raw);
}

// ── Translate: one chapter ──────────────────────────────────────
async function translateChapter(enChapter, langCode, langInfo) {
  const system = [
    `You are a professional travel-content translator working from English to ${langInfo.name} (${langInfo.nativeName}).`,
    'You return ONLY valid JSON — no markdown fences, no explanation before or after the JSON.',
  ].join(' ');

  const user = `Translate the following travel-guidebook chapter JSON to ${langInfo.name} (${langInfo.nativeName}).

RULES — follow every rule exactly:
1. TRANSLATE these fields: every "title" value, every "content" value.
2. DO NOT CHANGE these fields (copy verbatim): "id", "number", "icon".
3. PRESERVE all HTML tags exactly as they appear: <p>, </p>, <h4>, </h4>, <strong>, </strong>, <em>, </em>, <ul>, <li>, <ol>, etc.
4. Translate ONLY the human-readable text between and around HTML tags.
5. KEEP Italian proper nouns unchanged: Piazza del Duomo, Ponte Vecchio, Uffizi, Galleria dell'Accademia, Palazzo Pitti, Palazzo Vecchio, Boboli, Oltrarno, San Lorenzo, Santa Croce, Santa Maria Novella, Mercato Centrale, Piazzale Michelangelo, Arno, Brunelleschi, Michelangelo, Vasari, Botticelli, Ghiberti, Donatello, Medici, Giotto, Masaccio, Caravaggio, Leonardo da Vinci, etc.
6. "Florence" → "${langInfo.florence}".
7. Keep restaurant/shop/street names in their original Italian form.
8. Keep prices (€30, €16, etc.) and clock times (8:15am, 19:30, etc.) unchanged.
9. CRITICAL: Inside JSON string values, NEVER use raw double-quote characters ("). For quotation marks inside content, use Unicode curly quotes (\u201C and \u201D for English-style, \u201E and \u201C for German-style, \u00AB and \u00BB for French-style, etc.) or HTML entities (&ldquo; &rdquo; &quot;). This is essential for valid JSON output.
10. The output must be a single JSON object with the same structure as the input.

INPUT:
${JSON.stringify(enChapter, null, 2)}`;

  const raw = await callClaude(system, user, 8192);
  return extractJSON(raw);
}

// ── Structural validation ───────────────────────────────────────
function validate(translated, english) {
  const errors = [];

  // ── meta ──
  if (!translated.meta) { errors.push('Missing "meta"'); return errors; }
  for (const k of ['language', 'languageName', 'direction']) {
    if (!translated.meta[k]) errors.push(`Empty meta.${k}`);
  }

  // ── chapters ──
  if (!Array.isArray(translated.chapters)) { errors.push('Missing "chapters" array'); return errors; }
  if (translated.chapters.length !== english.chapters.length) {
    errors.push(`Chapter count: expected ${english.chapters.length}, got ${translated.chapters.length}`);
  }

  const n = Math.min(translated.chapters.length, english.chapters.length);
  for (let i = 0; i < n; i++) {
    const en = english.chapters[i];
    const tr = translated.chapters[i];
    const pfx = `Ch${en.number}`;

    // immutable fields
    if (tr.id !== en.id)       errors.push(`${pfx}: id "${tr.id}" should be "${en.id}"`);
    if (tr.number !== en.number) errors.push(`${pfx}: number mismatch`);
    if (tr.icon !== en.icon)   errors.push(`${pfx}: icon "${tr.icon}" should be "${en.icon}"`);

    if (!tr.title)             errors.push(`${pfx}: empty title`);

    if (!Array.isArray(tr.sections)) { errors.push(`${pfx}: missing sections`); continue; }
    if (tr.sections.length !== en.sections.length) {
      errors.push(`${pfx}: section count ${tr.sections.length} != ${en.sections.length}`);
    }

    const sn = Math.min(tr.sections.length, en.sections.length);
    for (let j = 0; j < sn; j++) {
      const eS = en.sections[j];
      const tS = tr.sections[j];
      const sp = `${pfx}/${eS.id}`;

      if (tS.id !== eS.id)                  errors.push(`${sp}: id mismatch`);
      if (!tS.title)                         errors.push(`${sp}: empty title`);
      if (!tS.content || tS.content.length < 50)
        errors.push(`${sp}: content too short (${tS.content?.length ?? 0} chars)`);
      if (/<script|<iframe|onclick|onerror/i.test(tS.content ?? ''))
        errors.push(`${sp}: XSS pattern detected`);
    }
  }

  // ── ui ──
  if (!translated.ui) { errors.push('Missing "ui" object'); }
  else {
    for (const key of Object.keys(english.ui)) {
      if (!(key in translated.ui))           errors.push(`ui: missing key "${key}"`);
      else if (!translated.ui[key])          errors.push(`ui: empty value for "${key}"`);
    }
  }

  return errors;
}

// ── Translate a single language (full pipeline) ─────────────────
async function translateLanguage(langCode) {
  const langInfo = LANGUAGES[langCode];
  if (!langInfo) throw new Error(`Unknown language "${langCode}". Use --list.`);

  const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const totalSteps = enData.chapters.length + 1; // +1 for UI strings
  const outPath = path.join(CONTENT_DIR, `${langCode}.json`);

  log(`━━━ ${langInfo.name} (${langCode}) ━━━━━━━━━━━━━━━━━━━━━━━`);
  log(`Model: ${MODEL}  |  Output: ${path.basename(outPath)}`);

  // 1. UI strings
  log(`[1/${totalSteps}] UI strings…`);
  const translatedUI = await translateUI(enData.ui, langCode, langInfo);
  log(`  ✓ ${Object.keys(translatedUI).length} keys`);
  await sleep(DELAY_MS);

  // 2. Chapters (one API call each)
  const translatedChapters = [];
  for (let i = 0; i < enData.chapters.length; i++) {
    const ch = enData.chapters[i];
    const step = i + 2;
    log(`[${step}/${totalSteps}] Ch${ch.number} "${ch.title}" (${ch.sections.length} sections)…`);

    const translated = await translateChapter(ch, langCode, langInfo);
    translatedChapters.push(translated);

    const secCount = translated.sections?.length ?? 0;
    log(`  ✓ ${secCount} sections`);

    if (i < enData.chapters.length - 1) await sleep(DELAY_MS);
  }

  // 3. Assemble
  const result = {
    meta: { language: langCode, languageName: langInfo.nativeName, direction: langInfo.dir },
    chapters: translatedChapters,
    ui: translatedUI,
  };

  // 4. Validate
  const errors = validate(result, enData);
  if (errors.length > 0) {
    logError(`Validation: ${errors.length} issue(s):`);
    errors.forEach((e) => logError(`  • ${e}`));
  } else {
    log('Validation: ✓ passed');
  }

  // 5. Write
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  log(`Written: ${outPath} (${kb} KB)`);

  return errors;
}

// ── --validate mode ─────────────────────────────────────────────
function runValidateAll() {
  const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  let total = 0;

  for (const [code, info] of Object.entries(LANGUAGES)) {
    const fp = path.join(CONTENT_DIR, `${code}.json`);
    if (!fs.existsSync(fp)) { log(`⊘  ${code} (${info.name}): not found`); continue; }

    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const errs = validate(data, enData);
      if (errs.length) {
        log(`✗  ${code} (${info.name}): ${errs.length} issue(s)`);
        errs.forEach((e) => log(`     ${e}`));
        total += errs.length;
      } else {
        const secs = data.chapters.reduce((s, c) => s + c.sections.length, 0);
        log(`✓  ${code} (${info.name}): OK — ${data.chapters.length} ch, ${secs} sections`);
      }
    } catch (err) {
      log(`✗  ${code} (${info.name}): parse error — ${err.message}`);
      total++;
    }
  }

  log(`\nTotal issues: ${total}`);
  return total;
}

// ── --list mode ─────────────────────────────────────────────────
function runList() {
  const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const enSecs = enData.chapters.reduce((s, c) => s + c.sections.length, 0);

  console.log('\n  Code  Language               Native         Dir   Florence         Status');
  console.log('  ----  ---------------------  -------------  ----  ---------------  ------');

  for (const [code, info] of Object.entries(LANGUAGES)) {
    const fp = path.join(CONTENT_DIR, `${code}.json`);
    let status = 'missing';

    if (fs.existsSync(fp)) {
      try {
        const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const secs = d.chapters.reduce((s, c) => s + c.sections.length, 0);
        const errs = validate(d, enData);
        status = errs.length === 0
          ? `ok (${secs} sections)`
          : `${errs.length} issues (${secs} sections)`;
      } catch { status = 'invalid JSON'; }
    }

    const c = code.padEnd(4);
    const n = info.name.padEnd(21);
    const nn = info.nativeName.padEnd(13);
    const d = info.dir.padEnd(4);
    const f = info.florence.padEnd(15);
    console.log(`  ${c}  ${n}  ${nn}  ${d}  ${f}  ${status}`);
  }

  console.log(`\n  Source: en.json — ${enData.chapters.length} chapters, ${enSecs} sections`);
  console.log(`  Per language: ${enData.chapters.length + 1} API calls (1 UI + ${enData.chapters.length} chapters)\n`);
}

// ── CLI entry point ─────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
translate-agent.js — Translate en.json → 17 language files via Anthropic API

Usage:
  node translate-agent.js <lang>         Translate one language (e.g. "it")
  node translate-agent.js --all          Translate all 17 languages sequentially
  node translate-agent.js --validate     Validate all existing files vs en.json
  node translate-agent.js --list         Show target languages and file status

Environment:
  ANTHROPIC_API_KEY      Required for translation
  TRANSLATE_MODEL        Model ID (default: ${MODEL})
  TRANSLATE_DELAY_MS     Delay between API calls, ms (default: ${DELAY_MS})
  TRANSLATE_MAX_RETRIES  Retries per failed call (default: ${MAX_RETRIES})

Per-language cost: 9 API calls (~$0.02–0.08 with Sonnet)
All 17 languages:   153 API calls (~$0.40–1.40 total)
`);
    process.exit(0);
  }

  // --list
  if (args.includes('--list')) { runList(); process.exit(0); }

  // --validate
  if (args.includes('--validate')) {
    const n = runValidateAll();
    process.exit(n > 0 ? 1 : 0);
  }

  // --all
  if (args.includes('--all')) {
    const codes = Object.keys(LANGUAGES);
    log(`Translating ${codes.length} languages with model ${MODEL}`);
    const failed = [];

    for (const code of codes) {
      try {
        const errs = await translateLanguage(code);
        if (errs.length) log(`⚠  ${code}: done with ${errs.length} issue(s)\n`);
        else log(`✓  ${code}: done\n`);
      } catch (err) {
        logError(`${code}: FAILED — ${err.message}\n`);
        failed.push(code);
      }
      await sleep(DELAY_MS * 3); // longer pause between languages
    }

    log(`Complete: ${codes.length - failed.length}/${codes.length} succeeded`);
    if (failed.length) logError(`Failed: ${failed.join(', ')}`);
    process.exit(failed.length > 0 ? 1 : 0);
  }

  // Single language
  const langCode = args[0].toLowerCase();
  if (!LANGUAGES[langCode]) {
    logError(`Unknown language "${langCode}". Available:`);
    Object.entries(LANGUAGES).forEach(([c, i]) => console.log(`  ${c}  ${i.name}`));
    process.exit(1);
  }

  try {
    const errs = await translateLanguage(langCode);
    process.exit(errs.length > 0 ? 1 : 0);
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }
}

main();
