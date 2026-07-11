import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { 
  PenTool, 
  Layout, 
  Play, 
  BarChart3, 
  Share2, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Tooltip } from '@/components/ui/Tooltip'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/', label: 'Compose', icon: PenTool },
  { path: '/templates', label: 'Templates', icon: Layout },
  { path: '/test', label: 'Test', icon: Play },
  { path: '/metrics', label: 'Metrics', icon: BarChart3 },
  { path: '/share', label: 'Share', icon: Share2 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } = useUIStore()

  const sidebarVariants = {
    expanded: { width: 'var(--sidebar-width)' },
    collapsed: { width: 'var(--sidebar-collapsed-width)' }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="sidebar-backdrop show-mobile-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={`sidebar ${sidebarOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
        initial={false}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Sparkles className="logo-icon" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span 
                  className="logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  PromptForge
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button 
            className="mobile-close-btn show-mobile-only"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Tooltip 
              key={item.path} 
              content={item.label} 
              position="right"
              // Only show tooltip when collapsed and on desktop
              delay={sidebarCollapsed ? 100 : 10000} 
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar()
                }}
              >
                <item.icon size={20} className="nav-icon" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span 
                      className="nav-label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        <div className="sidebar-footer hide-mobile">
          <button 
            className="collapse-toggle" 
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
