import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useLanguage } from './useLanguage'

export function useSearch() {
  const { content } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Create searchable items from content
  const searchableItems = useMemo(() => {
    if (!content?.chapters) return []
    
    const items = []
    content.chapters.forEach((chapter) => {
      chapter.sections?.forEach((section) => {
        items.push({
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          sectionId: section.id,
          sectionTitle: section.title,
          content: section.content?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
        })
      })
    })
    return items
  }, [content])

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(searchableItems, {
      keys: [
        { name: 'chapterTitle', weight: 0.3 },
        { name: 'sectionTitle', weight: 0.3 },
        { name: 'content', weight: 0.4 },
      ],
      threshold: 0.3,
      includeMatches: true,
      minMatchCharLength: 2,
    })
  }, [searchableItems])

  const search = useCallback((query) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }
    const results = fuse.search(query)
    setSearchResults(results.map(r => ({
      ...r.item,
      matches: r.matches,
    })))
  }, [fuse])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
  }, [])

  return {
    searchQuery,
    searchResults,
    search,
    clearSearch,
  }
}
