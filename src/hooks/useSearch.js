import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useLanguage } from './useLanguage'

export function useSearch() {
  const { content } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Create searchable items from content (sections only — for full search)
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
          content: section.content?.replace(/<[^>]*>/g, '') || '',
        })
      })
    })
    return items
  }, [content])

  // Initialize Fuse.js for full search
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

  // Suggestion items include both chapters and sections (for SearchBar dropdown)
  const suggestionItems = useMemo(() => {
    if (!content?.chapters) return []

    const items = []
    content.chapters.forEach((chapter) => {
      items.push({
        type: 'chapter',
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        title: chapter.title,
        sectionId: null,
        sectionTitle: null,
      })

      chapter.sections?.forEach((section) => {
        items.push({
          type: 'section',
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          sectionId: section.id,
          title: section.title,
          content: section.content?.replace(/<[^>]*>/g, '') || '',
        })
      })
    })
    return items
  }, [content])

  // Suggestion Fuse with SearchBar's config (lower threshold, title-weighted)
  const suggestFuse = useMemo(() => {
    return new Fuse(suggestionItems, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'chapterTitle', weight: 0.2 },
        { name: 'content', weight: 0.3 },
      ],
      threshold: 0.4,
      includeMatches: true,
      minMatchCharLength: 1,
    })
  }, [suggestionItems])

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

  const getSuggestions = useCallback((query, limit = 8) => {
    if (!query || query.trim().length < 1) return []
    return suggestFuse.search(query).slice(0, limit).map(r => r.item)
  }, [suggestFuse])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
  }, [])

  return {
    searchQuery,
    searchResults,
    search,
    getSuggestions,
    clearSearch,
  }
}
