# PDF-to-JSON Content Pipeline Plan

## Overview

Replace the current placeholder content in all 18 language JSON files with rich content extracted from 8 PDF source documents in `doc/`.

---

## Inventory

### PDF Source Files (8 files, 1.4 MB total)

| # | File | Size | Maps to Chapter ID |
|---|------|------|--------------------|
| 1 | `01 PLANNING YOUR VISIT.pdf` | 314 KB | `planning-your-visit` |
| 2 | `02 FLORENCE'S MOST BEAUTIFUL FREE PLACES.pdf` | 133 KB | `free-places` |
| 3 | `03 WHERE TO SHOP LIKE A LOCAL.pdf` | 181 KB | `shopping-like-local` |
| 4 | `04 WHERE FLORENTINES DINE.pdf` | 113 KB | `where-florentines-dine` |
| 5 | `05 DAY TRIPS FROM FLORENCE.pdf` | 156 KB | `day-trips` |
| 6 | `06 COMMON MISTAKES TO AVOID.pdf` | 117 KB | `common-mistakes` |
| 7 | `07 WHAT TO SEE IN FLORENCE.pdf` | 222 KB | `what-to-see` |
| 8 | `08 HOW TO SPEND 48 HOURS IN FLORENCE.pdf` | 176 KB | `48-hours-itinerary` |

### Target Language Files (18 files)

| Code | Language | Direction | Notes |
|------|----------|-----------|-------|
| `en` | English | LTR | **Primary** — statically imported, generated first |
| `it` | Italiano | LTR | |
| `es` | Español | LTR | |
| `fr` | Français | LTR | |
| `de` | Deutsch | LTR | |
| `pt` | Português | LTR | |
| `nl` | Nederlands | LTR | |
| `ru` | Русский | LTR | |
| `zh` | 中文 | LTR | Simplified Chinese |
| `ja` | 日本語 | LTR | |
| `ko` | 한국어 | LTR | |
| `ar` | العربية | **RTL** | Only RTL language |
| `hi` | हिन्दी | LTR | |
| `tr` | Türkçe | LTR | |
| `pl` | Polski | LTR | |
| `sv` | Svenska | LTR | |
| `da` | Dansk | LTR | |
| `no` | Norsk | LTR | |

### Existing JSON Schema (must be preserved exactly)

```jsonc
{
  "meta": {
    "language": "en",          // ISO 639-1 code
    "languageName": "English", // Native language name
    "direction": "ltr"         // "ltr" or "rtl" (only "ar" is RTL)
  },
  "chapters": [
    {
      "id": "planning-your-visit",   // URL slug — DO NOT CHANGE
      "number": 1,                   // 1-8 — DO NOT CHANGE
      "title": "Planning Your Visit",// Translated chapter title
      "icon": "calendar",            // Icon key — DO NOT CHANGE (shared w/ iconMap.js)
      "sections": [
        {
          "id": "section-1-1",       // Section ID — DO NOT CHANGE
          "title": "Best Time to Visit", // Translated section title
          "content": "<p>...</p>"    // HTML string — translated content
        }
      ]
    }
  ],
  "ui": {
    // 16 UI string keys — translated per language
    "search": "Search...",
    "menu": "Menu",
    "selectLanguage": "Select Language",
    "searchResults": "Search Results",
    "noResults": "No results found",
    "previous": "Previous",
    "next": "Next",
    "chapter": "Chapter",
    "appTitle": "Florence Guidebook",
    "appSubtitle": "Your Travel Companion",
    "madeWith": "Made with",
    "forFlorenceLovers": "for Florence lovers",
    "allRightsReserved": "All rights reserved",
    "chapterNotFound": "Chapter Not Found",
    "chapterNotFoundMessage": "The chapter you're looking for doesn't exist.",
    "result": "result",
    "results": "results",
    "tryDifferentKeywords": "Try searching with different keywords",
    "chapterAbbrev": "Ch.",
    "searchAllFor": "Search all for"
  }
}
```

### Immutable Fields (must NOT change across languages)

These fields are used for routing, linking, and icon rendering — they must remain identical in every language file:

- `chapters[].id` (URL slugs)
- `chapters[].number`
- `chapters[].icon`
- `chapters[].sections[].id`

### Translatable Fields

- `chapters[].title`
- `chapters[].sections[].title`
- `chapters[].sections[].content` (HTML)
- All `ui.*` keys

---

## Phase 1: Extract Content from PDFs → English JSON

### Step 1.1: Read Each PDF

- Read all 8 PDFs using the `Read` tool (supports PDF files).
- For each PDF, extract:
  - Chapter title (confirm it matches existing `en.json` title or update)
  - Section headings
  - Section body text
- Note: PDFs may contain formatting (bold, lists, links) that should be preserved as HTML.

### Step 1.2: Map PDF Content to JSON Structure

For each PDF → chapter mapping:

| PDF | Chapter ID | Icon | Expected Sections |
|-----|-----------|------|-------------------|
| 01 | `planning-your-visit` | `calendar` | Currently 3 sections (1-1, 1-2, 1-3) |
| 02 | `free-places` | `landmark` | Currently 4 sections (2-1 to 2-4) |
| 03 | `shopping-like-local` | `shopping-bag` | Currently 4 sections (3-1 to 3-4) |
| 04 | `where-florentines-dine` | `utensils` | Currently 3 sections (4-1 to 4-3) |
| 05 | `day-trips` | `map` | Currently 4 sections (5-1 to 5-4) |
| 06 | `common-mistakes` | `alert-triangle` | Currently 3 sections (6-1 to 6-3) |
| 07 | `what-to-see` | `camera` | Currently 3 sections (7-1 to 7-3) |
| 08 | `48-hours-itinerary` | `clock` | Currently 4 sections (8-1 to 8-4) |

**Key decisions to make per chapter:**
- If the PDF has **more sections** than the current JSON → add new section IDs (e.g., `section-1-4`)
- If the PDF has **fewer sections** → consolidate content into existing section count
- If the PDF section headings differ → update `title` fields to match PDF content
- Section `id` pattern must remain `section-{chapterNum}-{sectionNum}`

### Step 1.3: Convert PDF Text to HTML Content Strings

Transform extracted text into the HTML format used by `dangerouslySetInnerHTML`:
- Paragraphs → `<p>...</p>`
- Bold text → `<strong>...</strong>`
- Lists → `<ul><li>...</li></ul>` or `<ol><li>...</li></ol>`
- Subheadings within sections → `<h4>...</h4>` (if present)
- **No** `<script>`, `<iframe>`, or event handlers (XSS prevention)
- **No** external links (keep content self-contained)
- Escape special characters: `"` → `\"` within JSON strings

### Step 1.4: Build Updated `en.json`

- Preserve `meta` block exactly as-is
- Preserve `ui` block exactly as-is (no changes needed)
- Replace each chapter's `sections` array with the new PDF-derived content
- Update chapter `title` if the PDF uses a different wording
- Validate: all `id`, `number`, `icon` fields unchanged

---

## Phase 2: Translate `en.json` → 17 Other Languages

### Step 2.1: Translation Strategy

Process translations in batches to manage context window and quality:

**Batch 1 — Romance languages** (share vocabulary with Italian place names):
- `it` (Italian), `es` (Spanish), `fr` (French), `pt` (Portuguese)

**Batch 2 — Germanic languages**:
- `de` (German), `nl` (Dutch), `sv` (Swedish), `da` (Danish), `no` (Norwegian)

**Batch 3 — Slavic + Turkic**:
- `ru` (Russian), `pl` (Polish), `tr` (Turkish)

**Batch 4 — CJK languages**:
- `zh` (Chinese Simplified), `ja` (Japanese), `ko` (Korean)

**Batch 5 — Other scripts**:
- `ar` (Arabic — RTL), `hi` (Hindi)

### Step 2.2: Translation Rules

For every language file:

1. **Copy** the updated `en.json` as the starting point
2. **Set** `meta.language`, `meta.languageName`, `meta.direction` correctly
3. **Translate** all translatable fields (see list above)
4. **Keep immutable fields** identical: `id`, `number`, `icon`, section `id`
5. **Preserve HTML structure** — only translate text between tags
6. **Keep proper nouns** as-is or use accepted local forms:
   - Italian place names: keep original (e.g., "Piazza del Duomo", "Ponte Vecchio", "Uffizi")
   - Restaurant/shop names: keep original
   - "Florence" → use each language's equivalent (Firenze, Florencia, Florenz, etc.)
7. **UI strings**: translate all 16 `ui.*` keys appropriately
8. **Arabic special handling**:
   - `meta.direction`: `"rtl"`
   - Content should be natural Arabic (not transliterated)
   - HTML structure remains the same (browser handles RTL rendering)

### Step 2.3: Per-Language File Output

Each file written to `src/data/content/{code}.json`, preserving:
- UTF-8 encoding
- 2-space indentation
- No trailing commas
- No BOM

---

## Phase 3: Validation

### Step 3.1: JSON Syntax Validation

For each of the 18 files:
- Parse with `JSON.parse()` — must not throw
- Run via `node -e "JSON.parse(require('fs').readFileSync('{file}', 'utf8'))"`

### Step 3.2: Schema Validation

Verify every file has:
- [ ] `meta.language` matches filename (e.g., `fr.json` → `"fr"`)
- [ ] `meta.languageName` is non-empty
- [ ] `meta.direction` is `"ltr"` or `"rtl"` (only `ar` = `"rtl"`)
- [ ] Exactly 8 chapters
- [ ] Chapter `id`s match across all 18 files: `["planning-your-visit", "free-places", "shopping-like-local", "where-florentines-dine", "day-trips", "common-mistakes", "what-to-see", "48-hours-itinerary"]`
- [ ] Chapter `number`s are 1–8 in order
- [ ] Chapter `icon`s match across all files: `["calendar", "landmark", "shopping-bag", "utensils", "map", "alert-triangle", "camera", "clock"]`
- [ ] Section `id`s match across all 18 files (same count & naming per chapter)
- [ ] All `ui` keys present (same 16 keys in every file)
- [ ] No empty `title` or `content` fields

### Step 3.3: Content Quality Checks

- [ ] No raw `"` inside content strings (must be escaped or use HTML entities)
- [ ] No unmatched HTML tags in `content` fields
- [ ] No `<script>`, `<iframe>`, `onclick`, or other dangerous HTML
- [ ] Content length sanity: each section's `content` is ≥ 50 characters
- [ ] Italian place names preserved correctly across all languages

### Step 3.4: Build Verification

```bash
npm run lint        # ESLint passes
npm run build       # Vite production build succeeds
npm run preview     # Manual spot-check: navigate chapters, switch languages
```

---

## Execution Order Summary

```
Phase 1: PDF → English
  1.1  Read all 8 PDFs (parallel — can read all at once)
  1.2  Map content to chapter/section structure
  1.3  Convert text to HTML strings
  1.4  Write updated en.json

Phase 2: English → 17 Languages
  2.1  Batch 1: it, es, fr, pt (parallel within batch)
  2.2  Batch 2: de, nl, sv, da, no
  2.3  Batch 3: ru, pl, tr
  2.4  Batch 4: zh, ja, ko
  2.5  Batch 5: ar, hi

Phase 3: Validate
  3.1  JSON parse check (all 18 files)
  3.2  Schema cross-validation
  3.3  Content quality checks
  3.4  Build & lint verification
```

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| PDFs have different section structure than current JSON | Adapt section count; add new section IDs as needed |
| PDF text extraction loses formatting | Manually inspect and reconstruct HTML from PDF structure |
| Translation quality for CJK/Arabic | Use proper nouns as anchors; keep HTML intact |
| Large context needed for translation | Batch by language family; translate one chapter at a time if needed |
| JSON syntax errors from HTML escaping | Validate every file with `JSON.parse()` after writing |
| `iconMap.js` out of sync | No risk — icons are not changing, only content |
| Build breaks after content changes | Run `npm run build` as final gate |

---

## Estimated Scope

- **8 PDFs** to read and extract
- **1 English JSON** to update with rich content
- **17 language JSONs** to translate
- **18 files** to validate
- **~144 translation units** (8 chapters × 18 languages) + UI strings
