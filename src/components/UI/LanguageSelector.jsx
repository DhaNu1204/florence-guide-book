import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import FlagIcon from './FlagIcon'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentLanguage, changeLanguage, languages, content } = useLanguage()
  const dropdownRef = useRef(null)

  const currentLang = languages.find(l => l.code === currentLanguage)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        aria-label={content?.ui?.selectLanguage || 'Select Language'}
      >
        <FlagIcon countryCode={currentLang?.countryCode || 'gb'} className="w-6 h-4" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLang?.nativeName || 'English'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto scrollbar-thin">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2.5 text-left hover:bg-primary-50 flex items-center justify-between transition-colors ${
                currentLanguage === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <FlagIcon countryCode={lang.countryCode} className="w-7 h-5" />
                <div>
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-gray-500 text-sm ml-2">({lang.name})</span>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
