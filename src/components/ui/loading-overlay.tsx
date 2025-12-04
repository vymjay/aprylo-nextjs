'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, LogOut } from 'lucide-react'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  type?: 'default' | 'logout' | 'login' | 'processing'
}

export default function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  type = 'default' 
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isVisible || !mounted) return null

  const getTypeConfig = () => {
    switch (type) {
      case 'logout':
        return {
          icon: <LogOut className="w-8 h-8 text-blue-600" />,
          message: message || 'Signing you out...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          subText: 'This will only take a moment'
        }
      case 'login':
        return {
          icon: <Loader2 className="w-8 h-8 text-green-600 animate-spin" />,
          message: message || 'Signing you in...',
          bgColor: 'bg-green-50',
          textColor: 'text-green-900',
          subText: 'Setting up your session'
        }
      case 'processing':
        return {
          icon: <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />,
          message: message || 'Processing...',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-900',
          subText: 'Please wait'
        }
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
          message: message || 'Loading...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          subText: 'Please wait'
        }
    }
  }

  const config = getTypeConfig()

  const overlay = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      role="dialog"
      aria-modal="true"
      aria-label={config.message}
    >
      <div className={`${config.bgColor} rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-200 animate-fadeInScale`}>
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-full shadow-sm">
              {config.icon}
            </div>
          </div>
          
          {/* Message */}
          <div className="space-y-2">
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.message}
            </h3>
            <p className="text-sm text-gray-600">
              {config.subText}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-progress"
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )

  return createPortal(overlay, document.body)
}
