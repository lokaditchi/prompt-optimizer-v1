import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { BUILT_IN_TEMPLATES } from '@/lib/templates'
import type { TemplateCategory } from '@/types'
import { usePromptStore } from '@/store/promptStore'
import { TemplateCard } from './TemplateCard'
import { Input } from '@/components/ui/Input'
import './TemplateLibrary.css'

const CATEGORIES: { id: TemplateCategory | 'all', label: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'code-generation', label: 'Code Generation' },
  { id: 'debugging', label: 'Debugging' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'refactoring', label: 'Refactoring' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'testing', label: 'Testing' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'general', label: 'General' },
]

export function TemplateLibrary() {
  const navigate = useNavigate()
  const createPrompt = usePromptStore(state => state.createPrompt)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')

  const templates = BUILT_IN_TEMPLATES
  
  const filteredTemplates = templates.filter((t: any) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find((t: any) => t.id === templateId)
    if (!template) return
    
    createPrompt(
      `${template.name} (Copy)`, 
      template.description
    )
    navigate('/')
  }

  return (
    <div className="template-library page-container animate-fade-in">
      <div className="library-header">
        <div className="search-wrapper">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            icon={<Search size={18} />}
            aria-label="Search templates"
          />
        </div>
      </div>

      <div className="category-filters">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`filter-pill ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
            aria-pressed={activeCategory === category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="template-grid">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template: any, index: number) => (
            <div 
              key={template.id} 
              className="animate-slide-up" 
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
            >
              <TemplateCard 
                template={template} 
                onUse={() => handleUseTemplate(template.id)} 
              />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No templates found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
