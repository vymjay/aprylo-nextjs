// components/ui/Dialog.tsx
'use client'

import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  confirmVariant?: 'destructive' | 'primary' | 'outline'
  cancelLabel?: string
  cancelVariant?: 'outline' | 'primary'
  autoFocusCancel?: boolean
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

export default function Dialog({
  isOpen,
  title,
  onClose,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  cancelLabel = 'Cancel',
  cancelVariant = 'outline',
  autoFocusCancel = false,
  size = 'sm',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: DialogProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ 
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl 
          ${sizeClasses[size]} 
          w-full mx-4 
          animate-slideUp
          border border-gray-200
          transform transition-all duration-300 ease-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 
            id="dialog-title" 
            className="text-xl font-semibold text-gray-900" 
            tabIndex={0}
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 text-gray-700">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            autoFocus={autoFocusCancel}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${cancelVariant === 'outline'
                ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 shadow-sm'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg'
              }
            `}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg
              ${confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : confirmVariant === 'primary'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        @media (max-width: 640px) {
          .animate-slideUp {
            animation: slideUp 0.25s ease-out forwards;
          }
        }
      `}</style>
    </div>
  )
}