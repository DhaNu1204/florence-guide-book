# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # ESLint check on src/
npm run lint:fix     # ESLint auto-fix
```

No test framework is configured.

## Architecture

This is a static React SPA — a Florence travel guidebook with 18-language support. No backend; all content lives in JSON files.

### Routing (React Router 7)

- `/` redirects to `/chapter/planning-your-visit`
- `/chapter/:chapterId` — main content pages (8 chapters)
- `/search?q=` — full-text search results
- `/*` — 404 page

### Language System (`src/context/LanguageContext.jsx`)

English (`en.json`) is **statically imported** for instant first paint. All 17 other languages are **lazy-loaded** via `import()`. The current language persists in `localStorage` key `florence-guide-language`.

Arabic (`ar`) is the only RTL language — triggers `dir="rtl"` on the root element and conditional CSS/layout adjustments throughout components.

### Content Data (`src/data/content/*.json`)

Each language file has the schema: `{ meta, chapters[] }` where each chapter has `{ id, number, title, icon, sections[] }` and sections contain HTML strings rendered via `dangerouslySetInnerHTML` (content is trusted/pre-sanitized).

### Search (`src/hooks/useSearch.js`)

A single hook powers two distinct search modes with separate Fuse.js instances:
- **Full search** (SearchResults page): searches section content, threshold 0.3, min 2 chars
- **Suggestion search** (SearchBar dropdown): searches chapters + sections, threshold 0.4, returns up to 8 results

### Shared Icon Map (`src/data/iconMap.js`)

Maps chapter icon names to Lucide React components. Used by both Sidebar and ChapterView — keep in sync when adding chapters.

### Component Organization

- `components/Layout/` — Header, Sidebar, Footer, Layout (shell)
- `components/Content/` — ChapterView, SectionContent, SearchResults, NotFound
- `components/UI/` — SearchBar, LanguageSelector, FlagIcon
- `components/common/` — ErrorBoundary (wraps app in main.jsx), Loading spinner

## Key Patterns & Gotchas

- **Vite dynamic imports for JSON**: must use `.then(m => m.default)`
- **ESLint flat config** (`eslint.config.js`) with eslint-plugin-react-hooks v7: the `set-state-in-effect` rule requires using `useMemo` for derived state instead of `useEffect` + `setState`
- **`react/no-unescaped-entities`**: use `&ldquo;`/`&rdquo;`/`&apos;` for quotes in JSX
- **PropTypes disabled** — pure JS project, no TypeScript
- **RTL awareness**: Layout components conditionally flip margins/positioning for Arabic
- **Section anchors**: chapters link to sections via `#sectionId` with smooth scrolling
- **Windows**: a `nul` file exists in project root (reserved name) — it's in `.gitignore`
- **Deployment**: Apache-based (Hostinger) with SPA routing via `public/.htaccess`

## Styling

TailwindCSS 3 with a custom purple theme defined in `tailwind.config.js`. Custom utility classes (`.btn-primary`, `.card`, `.gradient-header`, `.search-highlight`, `.scrollbar-thin`) are in `src/styles/index.css`.
