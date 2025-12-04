'use client'

import { motion, type MotionProps } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedPageProps {
  children: ReactNode
  className?: string
  animationType?: 'fade' | 'slide' | 'scale' | 'none'
  duration?: number
  delay?: number
  motionProps?: MotionProps
}

export function AnimatedPage({ 
  children, 
  className = "", 
  animationType = 'fade',
  duration = 0.8,
  delay = 0,
  motionProps 
}: AnimatedPageProps) {
  
  const getAnimationConfig = () => {
    switch (animationType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
      case 'slide':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        }
      default:
        return {}
    }
  }

  const defaultProps: MotionProps = {
    ...getAnimationConfig(),
    transition: { 
      duration, 
      delay, 
      ease: "easeOut" 
    },
    ...motionProps
  }

  if (animationType === 'none') {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      {...defaultProps}
    >
      {children}
    </motion.div>
  )
}
