import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from './Button'
import './Modal.css'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideCloseButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-portal">
          <motion.div
            ref={overlayRef}
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            <motion.div
              className={`modal-content modal-size-${size}`}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || !hideCloseButton) && (
                <div className="modal-header">
                  {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
                  {!hideCloseButton && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onClose} 
                      className="modal-close-btn"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
              )}
              
              <div className="modal-body">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
