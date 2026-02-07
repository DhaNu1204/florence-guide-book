import { useRef, useEffect } from 'react'

export default function SectionContent({ section, index }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return
    contentRef.current.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  }, [section.content])

  return (
    <section id={section.id} className="card">
      {section.title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded-lg text-sm font-bold">
            {index + 1}
          </span>
          {section.title}
        </h2>
      )}

      <div
        ref={contentRef}
        className="content-section"
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    </section>
  )
}
