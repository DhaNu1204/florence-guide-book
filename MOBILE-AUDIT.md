# Mobile-Friendliness Audit Report

**App:** Florence Guidebook
**Date:** 2026-02-07
**Overall Score:** 6.5 / 10

---

## 1. Responsive Layout (320px-428px)

### Status: PARTIAL

**Good:**
- Tailwind CSS mobile-first approach used throughout
- Sidebar collapses to hamburger menu below `lg:` (1024px)
- Main content uses `p-4 md:p-6 lg:p-8` — 16px padding on mobile
- Footer is `text-center` and responsive

**Issues Found:**

| File | Issue | Severity |
|------|-------|----------|
| `Layout.jsx` | `max-w-4xl` (896px) container inside padded layout — fine on mobile but no `xs:` breakpoint coverage | Low |
| `ChapterView.jsx` | Chapter title `text-3xl` (30px) on 320px screen leaves only ~272px content width — tight but functional | Low |
| `ChapterView.jsx` | Prev/Next navigation `flex justify-between` — long translated button labels may wrap awkwardly on 320px | Medium |
| `LanguageSelector.jsx` | Dropdown `w-64` (256px) — could overflow on 320px screens with padding | Medium |
| `styles/index.css` | `.card` uses fixed `p-6` (24px) — excessive padding on very small screens | Low |
| `NotFound.jsx` | `py-16` (64px) vertical padding — wastes mobile screen real estate | Low |

---

## 2. Touch Targets (44x44px minimum)

### Status: FAIL

Multiple interactive elements are below the WCAG 2.5.5 recommended 44x44px minimum.

| Component | Element | Current Size | Required | Fix |
|-----------|---------|-------------|----------|-----|
| `Header.jsx` | Mobile search toggle button | `p-2` + 24px icon = ~40px | 44px | Add `min-h-[44px] min-w-[44px]` |
| `Header.jsx` | Menu hamburger button | `p-2` + 24px icon = ~40px | 44px | Add `min-h-[44px] min-w-[44px]` |
| `LanguageSelector.jsx` | Header language button | `px-3 py-2` + flag = ~36-40px | 44px | Add `min-h-[44px]` |
| `SearchBar.jsx` | Clear (X) button | `w-4 h-4` icon = 16px target | 44px | Wrap in 44px touch area |
| `SearchBar.jsx` | Input field | `py-2` = ~32-36px height | 44px | Change to `py-2.5` or `min-h-[44px]` |
| `ErrorBoundary.jsx` | Reload button | `padding: 0.5rem 1.5rem` = ~32px | 44px | Increase vertical padding |

---

## 3. Font Sizes

### Status: PARTIAL

**Good:**
- Body text defaults to 16px (Tailwind base) — prevents iOS zoom on input focus
- Sidebar menu items use `text-sm` (14px) — acceptable for navigation

**Issues Found:**

| File | Element | Size | Issue |
|------|---------|------|-------|
| `styles/index.css` | `.content-section h1` | `text-3xl` (30px) fixed | No responsive variant — should be `text-2xl md:text-3xl` |
| `styles/index.css` | `.content-section h2` | `text-2xl` (24px) fixed | No responsive variant — should be `text-xl md:text-2xl` |
| `styles/index.css` | `.content-section h3` | `text-xl` (20px) fixed | No responsive variant |
| `styles/index.css` | `.content-section h4` | `text-lg` (18px) fixed | No responsive variant |
| `SearchResults.jsx` | Chapter label | `text-xs` (12px) | Very small on mobile |

---

## 4. Images

### Status: NEEDS IMPROVEMENT

**Good:**
- No `<img>` tags in current content (all text/HTML)
- Loading spinner uses CSS, not images

**Issues Found:**

| File | Issue | Severity |
|------|-------|----------|
| `styles/index.css` | `.content-section img` has `rounded-lg shadow-md my-6` but **no `max-w-full h-auto`** | High |
| `SectionContent.jsx` | Content rendered via `dangerouslySetInnerHTML` — any future `<img>` in content HTML will lack responsive sizing | High |
| No lazy-loading | No `loading="lazy"` on dynamically rendered images | Medium |
| No optimization | No `vite-plugin-imagemin` or equivalent for build-time image optimization | Low |

---

## 5. Navigation

### Status: GOOD

**Working well:**
- Hamburger menu on screens < 1024px (`lg:hidden`)
- Sidebar slides in from left (or right for RTL) with smooth `transition-transform`
- Overlay backdrop when sidebar open on mobile
- Close sidebar when clicking a chapter link
- Sidebar `overflow-y-auto` handles long chapter lists

**Minor issues:**

| File | Issue | Severity |
|------|-------|----------|
| `Sidebar.jsx` | `w-64` (256px) sidebar — takes 80% of a 320px screen when open | Low |
| `Header.jsx` | Logo text `hidden sm:block` — on mobile only icon visible, which is fine | Info |

---

## 6. Tables

### Status: NOT HANDLED

No tables exist in current content, but content is rendered via `dangerouslySetInnerHTML` and could contain tables in the future.

| File | Issue | Severity |
|------|-------|----------|
| `styles/index.css` | No `.content-section table` overflow rule | Medium |
| — | Missing `display: block; overflow-x: auto;` for tables in content | Medium |

**Recommended CSS:**
```css
.content-section table {
  @apply block overflow-x-auto w-full;
}
```

---

## 7. RTL Support (Arabic)

### Status: PARTIAL

**Working well:**
- `App.jsx` sets `dir={isRTL ? 'rtl' : 'ltr'}` on root element
- `Sidebar.jsx` reverses position: `right-0` for RTL, `left-0` for LTR
- `Sidebar.jsx` reverses slide animation: `translate-x-full` vs `-translate-x-full`
- `Layout.jsx` reverses sidebar margin: `lg:mr-64` vs `lg:ml-64`
- `Footer.jsx` reverses sidebar offset correctly
- `styles/index.css` has `[dir="rtl"]` rules for sidebar and text-align

**Issues Found:**

| File | Issue | Severity |
|------|-------|----------|
| `SearchBar.jsx` | Search icon positioned with `left-3` — should flip to `right-3` in RTL | Medium |
| `SearchBar.jsx` | Input `pl-10 pr-10` padding — not RTL-aware (icon on wrong side) | Medium |
| `SearchBar.jsx` | Clear button positioned with `right-3` — should flip to `left-3` in RTL | Medium |
| `LanguageSelector.jsx` | Dropdown positioned with `right-0` — may need `left-0` in RTL | Low |
| `ChapterView.jsx` | Prev/Next arrows `←`/`→` — semantically wrong in RTL (should flip) | Medium |
| `styles/index.css` | No RTL-specific input field padding rules | Medium |

---

## 8. CJK Text (Chinese/Japanese/Korean)

### Status: ACCEPTABLE

**Good:**
- CJK text naturally wraps at character boundaries (no word-break issues)
- Content strings are HTML rendered via `dangerouslySetInnerHTML` — wraps correctly
- `line-clamp-2` in search results handles overflow

**Issues Found:**

| File | Issue | Severity |
|------|-------|----------|
| `styles/index.css` | No `line-break: strict` or `word-break: keep-all` for CJK | Low |
| — | Korean may need `word-break: keep-all` to avoid mid-syllable breaks | Low |
| `SearchBar.jsx` | Suggestion dropdown text may render wider in CJK due to character width | Low |

---

## 9. Long Words (German/Dutch)

### Status: FAIL

German compound words (e.g., "Sehenswurdigkeiten", "Nachbarschafts-Trattoria", "Restauranttreue") and Dutch equivalents can easily overflow containers on 320px screens.

| File | Issue | Severity |
|------|-------|----------|
| `styles/index.css` | `.content-section` has **no `overflow-wrap: break-word`** | High |
| `styles/index.css` | No `hyphens: auto` for European languages | High |
| `styles/index.css` | No `word-break: break-word` fallback | High |
| `ChapterView.jsx` | Chapter titles in German can be very long — no truncation or wrapping protection | Medium |
| `Sidebar.jsx` | Menu item text `truncate` — good, prevents sidebar overflow | Good |
| `SearchResults.jsx` | Section titles have no `break-words` class | Medium |

**Recommended CSS:**
```css
.content-section {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
```

---

## 10. Viewport Meta Tag

### Status: MOSTLY GOOD

**Current** (`index.html` line 6):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Missing:**
- `viewport-fit=cover` for notched iPhone displays
- `maximum-scale=5` (some accessibility guidelines recommend allowing zoom)

**Recommended:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

---

## 11. Safe Area Insets (Notched Phones)

### Status: NOT IMPLEMENTED

No `env(safe-area-inset-*)` usage anywhere in the codebase.

| File | Issue | Severity |
|------|-------|----------|
| `index.html` | Missing `viewport-fit=cover` | Medium |
| `styles/index.css` | No `env(safe-area-inset-*)` padding on body, header, or footer | Medium |
| `Header.jsx` | Fixed header could be obscured by notch on landscape rotation | Medium |
| `Footer.jsx` | Bottom content may be hidden behind home indicator on iPhones | Medium |

**Recommended CSS:**
```css
@supports (padding: max(0px)) {
  .gradient-header {
    padding-top: max(0.75rem, env(safe-area-inset-top));
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
  footer {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  }
}
```

---

## 12. Offline Capability

### Status: NOT IMPLEMENTED

| Item | Status |
|------|--------|
| Service Worker | None |
| PWA Manifest | None |
| Cache Strategy | None (browser default caching only) |
| `vite-plugin-pwa` | Not installed |
| Offline fallback page | None |
| App installability | Not supported |

The app is entirely dependent on network connectivity. On slow 3G/2G or airplane mode, the app is completely unusable after initial page load (language files are lazy-loaded via `import()`).

**Note:** English content is statically bundled and would work offline if a service worker cached the initial bundle. The 17 other languages would need runtime caching.

---

## Summary of All Issues

### Critical (Must Fix) — 5 issues

1. **Touch targets too small** — 6 interactive elements below 44x44px minimum (Header buttons, SearchBar input/clear, LanguageSelector button, ErrorBoundary button)
2. **No text overflow protection** — German/Dutch compound words will overflow on 320px screens (missing `overflow-wrap`, `word-break`, `hyphens`)
3. **Content images not responsive** — `.content-section img` lacks `max-w-full h-auto`
4. **RTL search bar broken** — Search icon and clear button don't flip position in Arabic
5. **No responsive typography** — Heading sizes fixed, not responsive to screen width

### High Priority — 4 issues

6. **No offline support** — No service worker, no PWA manifest, no caching strategy
7. **No safe area insets** — Content can be obscured by iPhone notch/home indicator
8. **Tables not handled** — Future `<table>` in content would overflow on mobile
9. **Language dropdown overflow** — `w-64` dropdown may exceed 320px viewport

### Medium Priority — 5 issues

10. **RTL prev/next arrows** — `←`/`→` semantically wrong in RTL languages
11. **Viewport meta incomplete** — Missing `viewport-fit=cover`
12. **Card padding excessive** — `.card p-6` wastes space on small screens
13. **NotFound page spacing** — `py-16` excessive on mobile
14. **SearchBar suggestion text** — May truncate awkwardly on small screens

### Low Priority — 4 issues

15. **No custom `xs:` breakpoint** — Tailwind starts at `sm: 640px`
16. **CJK line-break rules** — Korean may break mid-syllable without `word-break: keep-all`
17. **No image optimization plugin** — Build-time compression not configured
18. **Emoji fallbacks** — UI emojis may not render on all devices

---

## Recommended Fix Priority

```
Phase 1 (Critical UX):
  - Fix all touch targets to 44x44px minimum
  - Add overflow-wrap / word-break / hyphens to content sections
  - Add responsive typography (text-2xl md:text-3xl etc.)
  - Make content images responsive (max-w-full h-auto)
  - Fix RTL search bar icon positions

Phase 2 (Polish):
  - Add viewport-fit=cover and safe area insets
  - Add table overflow handling in content sections
  - Fix language dropdown width on small screens
  - Fix RTL prev/next navigation arrows
  - Reduce card/page padding on mobile

Phase 3 (Enhancement):
  - Implement PWA with service worker for offline support
  - Add image optimization to build pipeline
  - Add CJK-specific line-break rules
  - Add custom xs: breakpoint for 320px testing
```
