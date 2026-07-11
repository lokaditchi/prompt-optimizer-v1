import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Plus, Play } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { usePromptStore } from '@/store/promptStore'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import './Header.css'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const toggleSidebar = useUIStore(state => state.toggleSidebar)
  const createPrompt = usePromptStore(state => state.createPrompt)

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Compose'
      case '/templates': return 'Templates'
      case '/test': return 'Test Runner'
      case '/metrics': return 'Metrics'
      case '/share': return 'Share & Export'
      case '/settings': return 'Settings'
      default: return 'PromptForge'
    }
  }

  const handleNewPrompt = () => {
    createPrompt('New Prompt', 'Enter a description...')
    navigate('/')
  }

  return (
    <header className="header glass-subtle">
      <div className="header-left">
        <button 
          className="mobile-menu-btn show-mobile-only"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      
      <div className="header-right">
        <ThemeToggle />
        
        <div className="header-actions hide-mobile">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Play size={16} />}
            onClick={() => navigate('/test')}
          >
            Run Test
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={handleNewPrompt}
          >
            New Prompt
          </Button>
        </div>
      </div>
    </header>
  )
}
