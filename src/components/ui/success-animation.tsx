'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, LogOut, Heart } from 'lucide-react'

interface SuccessAnimationProps {
  isVisible: boolean
  title?: string
  message?: string
  type?: 'default' | 'logout' | 'login' | 'success'
  duration?: number
  onComplete?: () => void
}

export default function SuccessAnimation({ 
  isVisible, 
  title = 'Success!',
  message = 'Operation completed successfully',
  type = 'default',
  duration = 3000,
  onComplete
}: SuccessAnimationProps) {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'stay' | 'exit'>('enter')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset states when not visible
  useEffect(() => {
    if (!isVisible) {
      setShow(false)
      setAnimationPhase('enter')
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      setAnimationPhase('enter')
      
      // Move to stay phase
      const stayTimer = setTimeout(() => {
        setAnimationPhase('stay')
      }, 500)
      
      // Move to exit phase
      const exitTimer = setTimeout(() => {
        setAnimationPhase('exit')
      }, duration - 500)
      
      // Complete animation
      const completeTimer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, duration)
      
      return () => {
        clearTimeout(stayTimer)
        clearTimeout(exitTimer)
        clearTimeout(completeTimer)
      }
    }
  }, [isVisible, duration, onComplete])

  const getTypeConfig = () => {
    switch (type) {
      case 'logout':
        return {
          icon: <LogOut className="w-12 h-12 text-blue-600" />,
          title: title || 'Logged Out Successfully',
          message: message || 'You have been securely logged out. See you soon!',
          bgGradient: 'from-blue-500 to-blue-600',
          bgLight: 'bg-blue-50',
          emoji: '👋'
        }
      case 'login':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: title || 'Welcome Back!',
          message: message || 'You have been successfully logged in.',
          bgGradient: 'from-green-500 to-green-600',
          bgLight: 'bg-green-50',
          emoji: '🎉'
        }
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-emerald-600" />,
          title: title || 'Success!',
          message: message || 'Operation completed successfully.',
          bgGradient: 'from-emerald-500 to-emerald-600',
          bgLight: 'bg-emerald-50',
          emoji: '✅'
        }
      default:
        return {
          icon: <CheckCircle className="w-12 h-12 text-blue-600" />,
          title: title || 'Success!',
          message: message || 'Operation completed successfully.',
          bgGradient: 'from-blue-500 to-blue-600',
          bgLight: 'bg-blue-50',
          emoji: '✨'
        }
    }
  }

  if (!show || !mounted) return null

  const config = getTypeConfig()

  const animation = (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ease-out ${animationPhase === 'enter' ? 'opacity-0' : animationPhase === 'stay' ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        background: animationPhase === 'exit' ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: animationPhase === 'exit' ? 'none' : 'blur(4px)',
        WebkitBackdropFilter: animationPhase === 'exit' ? 'none' : 'blur(4px)'
      }}
    >
      <div className={`${config.bgLight} rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-200 transform transition-all duration-500 ease-out ${animationPhase === 'enter' ? 'scale-75 translate-y-8' : animationPhase === 'stay' ? 'scale-100 translate-y-0' : 'scale-110 translate-y-4 opacity-0'}`}>
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className={`flex justify-center transform transition-all duration-700 ease-out ${animationPhase === 'enter' ? 'scale-0 rotate-180' : animationPhase === 'stay' ? 'scale-100 rotate-0' : 'scale-125 rotate-12'}`}>
              <div className={`p-4 bg-gradient-to-br ${config.bgGradient} rounded-full shadow-lg ${animationPhase === 'stay' ? 'animate-bounce-gentle' : ''}`}>
                {config.icon}
              </div>
            </div>
            
            {/* Floating emoji */}
            <div className={`absolute -top-2 -right-2 text-2xl transform transition-all duration-1000 ease-out delay-300 ${animationPhase === 'enter' ? 'scale-0 rotate-180' : animationPhase === 'stay' ? 'scale-100 rotate-0' : 'scale-150 translate-y-2'}`}>
              {config.emoji}
            </div>
          </div>
          
          {/* Content */}
          <div className={`space-y-2 transform transition-all duration-500 ease-out delay-200 ${animationPhase === 'enter' ? 'opacity-0 translate-y-4' : animationPhase === 'stay' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <h3 className="text-xl font-bold text-gray-900">
              {config.title}
            </h3>
            <p className="text-gray-600">
              {config.message}
            </p>
          </div>
          
          {/* Heart animation for extra delight */}
          {type === 'logout' && (
            <div className={`flex justify-center space-x-1 transform transition-all duration-700 ease-out delay-500 ${animationPhase === 'enter' ? 'opacity-0 scale-0' : animationPhase === 'stay' ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i}
                  className={`w-4 h-4 text-red-400 ${animationPhase === 'stay' ? 'animate-pulse' : ''}`}
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )

  return createPortal(animation, document.body)
}
