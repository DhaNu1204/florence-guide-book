# Florence Guidebook

A beautiful, responsive React web application serving as a comprehensive Florence travel guidebook with support for 18 languages.

## Features

- 📖 **8 Comprehensive Chapters** covering everything from planning your visit to a 48-hour itinerary
- 🌍 **18 Languages** including English, Italian, Spanish, French, German, and more
- 🔍 **Full-text Search** with fuzzy matching powered by Fuse.js
- 📱 **Fully Responsive** design that works on desktop, tablet, and mobile
- 💜 **Beautiful Purple Theme** with modern UI/UX
- ♿ **Accessible** with ARIA labels and keyboard navigation
- 🌐 **RTL Support** for Arabic language

## Tech Stack

- **React 18** with Vite for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **React Router v6** for client-side routing
- **Fuse.js** for client-side fuzzy search
- **Lucide React** for beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
florence-guidebook/
├── public/
│   ├── favicon.svg
│   └── .htaccess          # For Apache/Hostinger deployment
├── src/
│   ├── components/
│   │   ├── Layout/        # Header, Sidebar, Footer, Layout
│   │   ├── Content/       # ChapterView, SectionContent, SearchResults
│   │   ├── UI/            # LanguageSelector, SearchBar, MenuItem
│   │   └── common/        # Loading spinner
│   ├── context/
│   │   └── LanguageContext.jsx
│   ├── data/
│   │   └── content/       # 18 language JSON files
│   ├── hooks/
│   │   ├── useLanguage.js
│   │   └── useSearch.js
│   ├── styles/
│   │   └── index.css      # Tailwind + custom styles
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Supported Languages

| Code | Language | Direction |
|------|----------|-----------|
| en | English | LTR |
| it | Italian | LTR |
| es | Spanish | LTR |
| fr | French | LTR |
| de | German | LTR |
| pt | Portuguese | LTR |
| nl | Dutch | LTR |
| ru | Russian | LTR |
| zh | Chinese (Simplified) | LTR |
| ja | Japanese | LTR |
| ko | Korean | LTR |
| ar | Arabic | RTL |
| hi | Hindi | LTR |
| tr | Turkish | LTR |
| pl | Polish | LTR |
| sv | Swedish | LTR |
| da | Danish | LTR |
| no | Norwegian | LTR |

## Deployment to Hostinger

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist/` folder to your Hostinger `public_html` directory

3. The `.htaccess` file is automatically included for proper SPA routing

## Customization

### Adding/Editing Content

Content is stored in JSON files under `src/data/content/`. Each language has its own file (e.g., `en.json`, `it.json`).

### Changing the Color Theme

Edit the color palette in `tailwind.config.js` under `theme.extend.colors.primary`.

### Adding New Languages

1. Create a new JSON file in `src/data/content/` following the existing schema
2. Import and add it to `languageData` in `src/context/LanguageContext.jsx`
3. Add the language info to the `languages` array in the same file

## License

© 2026 Florence Guidebook. All rights reserved.
