import { Heart } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function Footer() {
  const { isRTL, content } = useLanguage()

  return (
    <footer className={`bg-gray-100 border-t border-gray-200 py-6 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span>{content?.ui?.madeWith || 'Made with'}</span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>{content?.ui?.forFlorenceLovers || 'for Florence lovers'}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          © {new Date().getFullYear()} {content?.ui?.appTitle || 'Florence Guidebook'}. {content?.ui?.allRightsReserved || 'All rights reserved'}.
        </p>
      </div>
    </footer>
  )
}
