import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import SectionContent from './SectionContent'
import Loading from '../common/Loading'
import { Calendar } from 'lucide-react'
import iconMap from '../../data/iconMap'

export default function ChapterView() {
  const { chapterId } = useParams()
  const { content } = useLanguage()

  if (!content?.chapters) {
    return <Loading />
  }

  const chapter = content.chapters.find(ch => ch.id === chapterId)

  if (!chapter) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{content?.ui?.chapterNotFound || 'Chapter Not Found'}</h2>
        <p className="text-gray-600">{content?.ui?.chapterNotFoundMessage || "The chapter you're looking for doesn't exist."}</p>
      </div>
    )
  }

  const IconComponent = iconMap[chapter.icon] || Calendar

  return (
    <article className="space-y-8">
      {/* Chapter Header */}
      <header className="card bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 shrink-0">
            <IconComponent className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-2">
              {content?.ui?.chapter || 'Chapter'} {chapter.number}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
          </div>
        </div>
      </header>

      {/* Chapter Sections */}
      <div className="space-y-6">
        {chapter.sections?.map((section, index) => (
          <SectionContent key={section.id} section={section} index={index} />
        ))}
      </div>

      {/* Chapter Navigation */}
      <ChapterNavigation currentChapter={chapter} chapters={content.chapters} content={content} />
    </article>
  )
}

function ChapterNavigation({ currentChapter, chapters, content }) {
  const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id)
  const prevChapter = chapters[currentIndex - 1]
  const nextChapter = chapters[currentIndex + 1]

  return (
    <nav className="flex justify-between items-center pt-8 border-t border-gray-200">
      {prevChapter ? (
        <Link
          to={`/chapter/${prevChapter.id}`}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>←</span>
          <div className="text-left">
            <span className="text-sm text-gray-500 block">{content?.ui?.previous || 'Previous'}</span>
            <span className="font-medium">{prevChapter.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextChapter ? (
        <Link
          to={`/chapter/${nextChapter.id}`}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors text-right"
        >
          <div>
            <span className="text-sm text-gray-500 block">{content?.ui?.next || 'Next'}</span>
            <span className="font-medium">{nextChapter.title}</span>
          </div>
          <span>→</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
