import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store/uiStore'
import './AppShell.css'

export function AppShell() {
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-shell__main">
        <Header />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
