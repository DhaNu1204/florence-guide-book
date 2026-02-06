import { createContext, useState, useCallback, useEffect } from 'react'

// Only English is statically imported (instant default)
import en from '../data/content/en.json'

const languageLoaders = {
  en: () => Promise.resolve(en),
  it: () => import('../data/content/it.json').then(m => m.default),
  es: () => import('../data/content/es.json').then(m => m.default),
  fr: () => import('../data/content/fr.json').then(m => m.default),
  de: () => import('../data/content/de.json').then(m => m.default),
  pt: () => import('../data/content/pt.json').then(m => m.default),
  nl: () => import('../data/content/nl.json').then(m => m.default),
  ru: () => import('../data/content/ru.json').then(m => m.default),
  zh: () => import('../data/content/zh.json').then(m => m.default),
  ja: () => import('../data/content/ja.json').then(m => m.default),
  ko: () => import('../data/content/ko.json').then(m => m.default),
  ar: () => import('../data/content/ar.json').then(m => m.default),
  hi: () => import('../data/content/hi.json').then(m => m.default),
  tr: () => import('../data/content/tr.json').then(m => m.default),
  pl: () => import('../data/content/pl.json').then(m => m.default),
  sv: () => import('../data/content/sv.json').then(m => m.default),
  da: () => import('../data/content/da.json').then(m => m.default),
  no: () => import('../data/content/no.json').then(m => m.default),
}

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', countryCode: 'gb' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', countryCode: 'it' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', countryCode: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', countryCode: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', countryCode: 'de' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', countryCode: 'pt' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', countryCode: 'nl' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', countryCode: 'ru' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', countryCode: 'cn' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', countryCode: 'jp' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', countryCode: 'kr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', countryCode: 'sa' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', countryCode: 'in' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', countryCode: 'tr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', countryCode: 'pl' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', countryCode: 'se' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', countryCode: 'dk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', countryCode: 'no' },
]

export const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('florence-guide-language')
    return saved || 'en'
  })

  const [content, setContent] = useState(en)
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false)

  const changeLanguage = useCallback(async (langCode) => {
    if (!languageLoaders[langCode]) return
    setCurrentLanguage(langCode)
    localStorage.setItem('florence-guide-language', langCode)
    document.documentElement.lang = langCode

    if (langCode === 'en') {
      setContent(en)
      return
    }

    setIsLoadingLanguage(true)
    try {
      const data = await languageLoaders[langCode]()
      setContent(data)
    } finally {
      setIsLoadingLanguage(false)
    }
  }, [])

  // Load saved language on mount if not English
  useEffect(() => {
    const saved = localStorage.getItem('florence-guide-language')
    if (saved && saved !== 'en' && languageLoaders[saved]) {
      document.documentElement.lang = saved
      setIsLoadingLanguage(true)
      languageLoaders[saved]().then((data) => {
        setContent(data)
        setIsLoadingLanguage(false)
      })
    } else {
      document.documentElement.lang = 'en'
    }
  }, [])

  const currentLangInfo = languages.find(l => l.code === currentLanguage) || languages[0]
  const isRTL = currentLangInfo.direction === 'rtl'

  const value = {
    currentLanguage,
    changeLanguage,
    content,
    languages,
    isRTL,
    isLoadingLanguage,
    currentLangInfo,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
