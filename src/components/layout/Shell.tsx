import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { useState, useCallback } from 'react'

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex flex-1 flex-col min-w-0 overflow-y-auto overscroll-y-contain transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 animate-fade-in pb-28 lg:pb-8">
          <Outlet />
        </main>
        <footer className="hidden lg:block px-8 py-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Data source: EWURA (Energy and Water Utilities Regulatory Authority) Tanzania · Prices in TZS/litre
        </footer>
      </div>

      <BottomNav />
    </div>
  )
}
