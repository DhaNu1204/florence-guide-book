import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { useSearch } from '../../hooks/useSearch'
import { useLanguage } from '../../hooks/useLanguage'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchResults, search, searchQuery } = useSearch()
  const { content } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    if (query && query !== searchQuery) {
      search(query)
    }
  }, [query, search, searchQuery])

  const handleResultClick = (result) => {
    navigate(`/chapter/${result.chapterId}#${result.sectionId}`)
  }

  const highlightText = (text, maxLength = 200) => {
    if (!text) return ''
    const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    if (!query) return truncated

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    return truncated.replace(regex, (match) => {
      const safe = match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<mark class="search-highlight">${safe}</mark>`
    })
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {content?.ui?.searchResults || 'Search Results'}
            </h1>
            <p className="text-gray-600">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((result, index) => (
            <button
              key={`${result.chapterId}-${result.sectionId}-${index}`}
              onClick={() => handleResultClick(result)}
              className="card w-full text-left hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                      Chapter {result.chapterNumber}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{result.chapterTitle}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">
                    {result.sectionTitle}
                  </h3>
                  
                  <p 
                    className="text-sm text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.content) }}
                  />
                </div>
                
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      ) : query ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {content?.ui?.noResults || 'No results found'}
          </h2>
          <p className="text-gray-600">
            Try searching with different keywords
          </p>
        </div>
      ) : null}
    </div>
  )
}
