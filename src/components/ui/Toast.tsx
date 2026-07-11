import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import './Toast.css'

const icons = {
  success: <CheckCircle className="toast-icon success" />,
  error: <XCircle className="toast-icon error" />,
  info: <Info className="toast-icon info" />,
  warning: <AlertTriangle className="toast-icon warning" />
}

export function ToastContainer() {
  const toasts = useUIStore(state => state.toasts)
  const removeToast = useUIStore(state => state.removeToast)

  return (
    <div className="toast-container" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`toast toast-${toast.type}`}
            role="alert"
          >
            <div className="toast-content">
              {icons[toast.type]}
              <p className="toast-message">{toast.message}</p>
            </div>
            <button 
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
