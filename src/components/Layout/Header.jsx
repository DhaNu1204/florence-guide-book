import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LanguageSelector from '../UI/LanguageSelector'
import SearchBar from '../UI/SearchBar'
import { useLanguage } from '../../hooks/useLanguage'

export default function Header({ onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { content } = useLanguage()
  const navigate = useNavigate()

  return (
    <header className="gradient-header text-white sticky top-0 z-50 shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu button and Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={content?.ui?.menu || 'Menu'}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/chapter/planning-your-visit')}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">{content?.ui?.appTitle || 'Florence Guidebook'}</h1>
                <p className="text-xs text-primary-200">{content?.ui?.appSubtitle || 'Your Travel Companion'}</p>
              </div>
            </div>
          </div>

          {/* Right: Search and Language */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={content?.ui?.search || 'Search'}
            >
              {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
            </button>
            
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden mt-3">
            <SearchBar onSearch={() => setSearchOpen(false)} />
          </div>
        )}
      </div>
    </header>
  )
}
