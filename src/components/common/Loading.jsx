export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg" role="img" aria-hidden="true">🏛️</span>
        </div>
      </div>
    </div>
  )
}
