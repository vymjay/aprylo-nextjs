'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, Shield, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LogoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userEmail?: string
  isLoading?: boolean
}

export default function LogoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isLoading = false
}: LogoutConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset confirming state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (isConfirming) return // Prevent double-clicks
    
    setIsConfirming(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Logout confirmation error:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    if (isConfirming) return // Prevent closing during confirmation
    setIsConfirming(false)
    onClose()
  }

  if (!isOpen || !mounted) return null

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out animate-slideUpScale border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-full">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 id="logout-title" className="text-xl font-semibold text-gray-900">
                Sign Out Confirmation
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                You're about to sign out
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {userEmail && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Current User</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to sign out of your account?
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="flex items-center text-sm font-medium text-blue-900 mb-2">
                <Shield className="w-4 h-4 mr-2" />
                What happens when you logout:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <ShoppingCart className="w-3 h-3 mr-2 flex-shrink-0" />
                  Your cart items will be saved
                </li>
                <li className="flex items-center">
                  <User className="w-3 h-3 mr-2 flex-shrink-0" />
                  You'll need to login again to access your account
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isConfirming || isLoading}
            className="flex-1 font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className="flex-1 font-medium"
          >
            {isConfirming ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing out...</span>
              </div>
            ) : (
              'Sign Out'
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUpScale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideUpScale {
          animation: slideUpScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )

  return createPortal(modal, document.body)
}
