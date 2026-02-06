import { createContext, useState, useEffect, useCallback } from 'react'

// Import all language files
import en from '../data/content/en.json'
import it from '../data/content/it.json'
import es from '../data/content/es.json'
import fr from '../data/content/fr.json'
import de from '../data/content/de.json'
import pt from '../data/content/pt.json'
import nl from '../data/content/nl.json'
import ru from '../data/content/ru.json'
import zh from '../data/content/zh.json'
import ja from '../data/content/ja.json'
import ko from '../data/content/ko.json'
import ar from '../data/content/ar.json'
import hi from '../data/content/hi.json'
import tr from '../data/content/tr.json'
import pl from '../data/content/pl.json'
import sv from '../data/content/sv.json'
import da from '../data/content/da.json'
import no from '../data/content/no.json'

const languageData = {
  en, it, es, fr, de, pt, nl, ru, zh, ja, ko, ar, hi, tr, pl, sv, da, no
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

  const [content, setContent] = useState(languageData[currentLanguage] || languageData.en)

  const changeLanguage = useCallback((langCode) => {
    if (languageData[langCode]) {
      setCurrentLanguage(langCode)
      setContent(languageData[langCode])
      localStorage.setItem('florence-guide-language', langCode)
    }
  }, [])

  useEffect(() => {
    setContent(languageData[currentLanguage] || languageData.en)
  }, [currentLanguage])

  const currentLangInfo = languages.find(l => l.code === currentLanguage) || languages[0]
  const isRTL = currentLangInfo.direction === 'rtl'

  const value = {
    currentLanguage,
    changeLanguage,
    content,
    languages,
    isRTL,
    currentLangInfo,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
