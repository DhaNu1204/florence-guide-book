import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="card text-center py-16">
      <div className="text-7xl mb-6">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Return Home
      </button>
    </div>
  )
}
