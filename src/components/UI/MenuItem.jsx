import { ChevronRight } from 'lucide-react'

export default function MenuItem({ icon: Icon, title, number, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`menu-item w-full text-left ${isActive ? 'active' : ''}`}
    >
      {Icon && (
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-600">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <span className="flex-1 text-sm">
        {number && <span className="text-primary-600 font-semibold">{number}.</span>}{' '}
        {title}
      </span>
      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />
    </button>
  )
}
