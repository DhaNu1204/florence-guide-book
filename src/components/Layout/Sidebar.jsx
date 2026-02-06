import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import iconMap from '../../data/iconMap'

export default function Sidebar({ isOpen, onClose }) {
  const { content, isRTL } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const handleChapterClick = (chapterId) => {
    navigate(`/chapter/${chapterId}`)
    onClose()
  }

  const chapters = content?.chapters || []

  return (
    <aside
      className={`
        fixed top-[60px] bottom-0 w-64 bg-white border-r border-gray-200 
        overflow-y-auto scrollbar-thin z-40
        transform transition-transform duration-300 ease-in-out
        ${isRTL ? 'right-0 border-l border-r-0' : 'left-0'}
        ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <nav className="p-4">
        <ul className="space-y-1">
          {chapters.map((chapter) => {
            const IconComponent = iconMap[chapter.icon] || Calendar
            const isActive = location.pathname === `/chapter/${chapter.id}`
            
            return (
              <li key={chapter.id}>
                <button
                  onClick={() => handleChapterClick(chapter.id)}
                  className={`menu-item w-full text-left ${isActive ? 'active' : ''}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-600">
                    <IconComponent className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-sm">
                    <span className="text-primary-600 font-semibold">{chapter.number}.</span>{' '}
                    {chapter.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
