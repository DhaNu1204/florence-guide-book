import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useLanguage } from '../../hooks/useLanguage'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isRTL } = useLanguage()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={toggleSidebar} />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} transition-all duration-300`}>
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}
