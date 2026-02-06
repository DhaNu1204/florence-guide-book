import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useSearch } from '../../hooks/useSearch'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { content } = useLanguage()
  const { search, getSuggestions } = useSearch()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Derive suggestions from query (no effect needed)
  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return []
    return getSuggestions(query, 8)
  }, [query, getSuggestions])

  const handleQueryChange = (value) => {
    setQuery(value)
    setSelectedIndex(-1)
    if (value.trim().length >= 1) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (query.trim()) {
      search(query)
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setShowSuggestions(false)
      onSearch?.()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery('')
    setShowSuggestions(false)
    
    if (suggestion.type === 'chapter') {
      navigate(`/chapter/${suggestion.chapterId}`)
    } else {
      navigate(`/chapter/${suggestion.chapterId}#${suggestion.sectionId}`)
    }
    onSearch?.()
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (query.trim().length >= 1 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Highlight matching text in suggestions
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-gray-900 font-medium">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={content?.ui?.search || 'Search...'}
          className="w-full md:w-64 lg:w-80 pl-10 pr-10 py-2 bg-white/90 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.chapterId}-${suggestion.sectionId || 'chapter'}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
                    {suggestion.type === 'chapter' ? (content?.ui?.chapter || 'Chapter') : `${content?.ui?.chapterAbbrev || 'Ch.'} ${suggestion.chapterNumber}`}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {highlightMatch(suggestion.title, query)}
                  </span>
                </div>
                {suggestion.type === 'section' && suggestion.chapterTitle && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {suggestion.chapterTitle}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            </button>
          ))}
          
          {/* Show all results option */}
          <button
            type="submit"
            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-primary-600 font-medium flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {content?.ui?.searchAllFor || 'Search all for'} &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </form>
  )
}
