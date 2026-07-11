import React from 'react'

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  children,
  className = ''
}: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'var(--color-accent-green-muted)', color: 'var(--color-accent-green)' }
      case 'warning':
        return { bg: 'var(--color-accent-amber-muted)', color: 'var(--color-accent-amber)' }
      case 'error':
        return { bg: 'var(--color-accent-red-muted)', color: 'var(--color-accent-red)' }
      case 'info':
        return { bg: 'var(--color-accent-cyan-muted)', color: 'var(--color-accent-cyan)' }
      case 'neutral':
      default:
        return { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }
    }
  }

  const { bg, color } = getColors()
  const padding = size === 'sm' ? 'var(--space-0.5) var(--space-1.5)' : 'var(--space-1) var(--space-2.5)'
  const fontSize = size === 'sm' ? 'var(--font-size-xs)' : 'var(--font-size-sm)'

  return (
    <span 
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        color: color,
        padding: padding,
        borderRadius: 'var(--radius-full)',
        fontSize: fontSize,
        fontWeight: 'var(--font-weight-medium)',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        border: `1px solid ${bg.replace('0.15)', '0.3)')}`
      }}
    >
      {children}
    </span>
  )
}
