import React, { useState } from 'react'
import { 
  Code2, 
  Bug, 
  Eye, 
  Wrench, 
  FileText, 
  TestTube, 
  Layers, 
  MessageSquare,
  ArrowRight
} from 'lucide-react'
import type { Template } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import './TemplateCard.css'

interface TemplateCardProps {
  template: Template
  onUse: () => void
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'code-generation': return 'var(--color-accent-cyan)'
    case 'debugging': return 'var(--color-accent-red)'
    case 'code-review': return 'var(--color-accent-purple)'
    case 'refactoring': return 'var(--color-accent-amber)'
    case 'documentation': return 'var(--color-accent-green)'
    case 'testing': return 'var(--color-accent-cyan)'
    case 'architecture': return 'var(--color-accent-purple)'
    default: return 'var(--color-text-muted)'
  }
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'code': return <Code2 size={24} />
    case 'bug': return <Bug size={24} />
    case 'eye': return <Eye size={24} />
    case 'wrench': return <Wrench size={24} />
    case 'file-text': return <FileText size={24} />
    case 'test-tube': return <TestTube size={24} />
    case 'layers': return <Layers size={24} />
    default: return <MessageSquare size={24} />
  }
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const accentColor = getCategoryColor(template.category)

  return (
    <>
      <div 
        className="template-card glass"
        onClick={() => setIsPreviewOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View template: ${template.name}`}
      >
        <div className="card-accent" style={{ backgroundColor: accentColor }} />
        
        <div className="card-content">
          <div className="card-header">
            <div className="icon-wrapper" style={{ color: accentColor }}>
              {getIcon(template.icon)}
            </div>
            <Badge variant="neutral" size="sm" className="category-badge">
              {template.category.replace('-', ' ')}
            </Badge>
          </div>
          
          <h3 className="card-title">{template.name}</h3>
          <p className="card-description">{template.description}</p>
          
          <div className="card-footer">
            <span className="placeholder-count">
              {template.placeholders.length} placeholder{template.placeholders.length !== 1 ? 's' : ''}
            </span>
            <button 
              className="use-btn"
              onClick={(e) => {
                e.stopPropagation()
                onUse()
              }}
              aria-label={`Use ${template.name} template`}
            >
              Use <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
        title={template.name}
        size="lg"
      >
        <div className="template-preview">
          <p className="preview-desc text-muted mb-4">{template.description}</p>
          
          <div className="preview-section">
            <h4>System Message</h4>
            <div className="preview-block system">
              {template.systemMessage || 'No system message defined.'}
            </div>
          </div>
          
          <div className="preview-section mt-4">
            <h4>Prompt Content</h4>
            <div className="preview-block prompt">
              {template.content}
            </div>
          </div>
          
          {template.placeholders.length > 0 && (
            <div className="preview-section mt-4">
              <h4>Placeholders</h4>
              <div className="placeholders-list">
                {template.placeholders.map(p => (
                  <div key={p.key} className="placeholder-item">
                    <span className="p-key">{p.key}</span>
                    <span className="p-desc text-muted">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="preview-actions mt-6">
            <Button variant="primary" onClick={onUse}>
              Use This Template
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
