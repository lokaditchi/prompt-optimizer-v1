import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import './Tooltip.css'

export interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactElement
}

export function Tooltip({ content, position = 'top', delay = 300, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const targetRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<number>()

  const updatePosition = () => {
    if (!targetRef.current) return
    const rect = targetRef.current.getBoundingClientRect()
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })
  }

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const child = React.Children.only(children)
  const childProps = {
    ...child.props,
    ref: targetRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      if (child.props.onMouseEnter) child.props.onMouseEnter(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      if (child.props.onMouseLeave) child.props.onMouseLeave(e)
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter()
      if (child.props.onFocus) child.props.onFocus(e)
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave()
      if (child.props.onBlur) child.props.onBlur(e)
    }
  }

  const getVariants = () => {
    switch (position) {
      case 'top': return { initial: { y: 5, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'bottom': return { initial: { y: -5, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'left': return { initial: { x: 5, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case 'right': return { initial: { x: -5, opacity: 0 }, animate: { x: 0, opacity: 1 } }
    }
  }

  return (
    <>
      {React.cloneElement(child, childProps)}
      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            className={`tooltip tooltip-${position}`}
            style={{
              left: coords.x,
              top: coords.y,
            }}
            initial="initial"
            animate="animate"
            exit="initial"
            variants={getVariants()}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
            <div className="tooltip-arrow" />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
