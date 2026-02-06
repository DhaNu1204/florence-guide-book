import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ChapterView from './components/Content/ChapterView'
import SearchResults from './components/Content/SearchResults'
import NotFound from './components/Content/NotFound'
import { useLanguage } from './hooks/useLanguage'

function App() {
  const { isRTL } = useLanguage()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chapter/planning-your-visit" replace />} />
          <Route path="/chapter/:chapterId" element={<ChapterView />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
