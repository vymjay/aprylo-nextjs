'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import LogoutConfirmation from '@/components/ui/logout-confirmation'
import LoadingOverlay from '@/components/ui/loading-overlay'
import SuccessAnimation from '@/components/ui/success-animation'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useUserRole, useIsAdmin, useInternalUserData } from '@/hooks/api/use-users'

function getInitials(email: string) {
  if (!email) return '??'
  const namePart = email.split('@')[0]
  if (!namePart) return '??'
  return namePart
    .split(/[.\-_ ]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('') || '??'
}

const NAV_ITEMS = [
  {
    href: '/account/profile',
    label: 'Profile Settings',
    tooltip: 'Update your profile information',
  },
  {
    href: '/change-password',
    label: 'Change Password',
    tooltip: 'Change your account password',
  },
  {
    href: '/account/orders',
    label: 'Order History',
    tooltip: 'View your past orders and invoices',
  },
]

const ADMIN_NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Admin Dashboard',
    tooltip: 'Access admin panel',
  },
  {
    href: '/admin/products',
    label: 'Manage Products',
    tooltip: 'Manage product catalog',
  },
]

export default function AccountDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const { data: userRole } = useUserRole()
  const { data: adminCheckResult, isLoading: isAdminLoading } = useIsAdmin()
  const { data: internalUserData } = useInternalUserData()
  
  // Extract admin status from the result
  const isAdmin = adminCheckResult?.isAdmin || false

  const [loading, setLoading] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      const lastLoginFromMeta =
        user.user_metadata?.lastLogin ?? new Date().toISOString()
      const formattedDate = new Date(lastLoginFromMeta).toLocaleString()
      setLastLogin(formattedDate)
    }
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setShowLogoutConfirm(false)
      }
    }
    
    if (open || showLogoutConfirm) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [open, showLogoutConfirm])

  const handleLogout = async () => {
    // Prevent multiple simultaneous logout attempts
    if (loading) return
    
    setLoading(true)
    setShowLoadingOverlay(true)
    
    try {
      // Close dialogs immediately for better UX
      setShowLogoutConfirm(false)
      setOpen(false)
      
      // Perform logout
      await logout()
      
      // Hide loading and show success animation
      setShowLoadingOverlay(false)
      setShowSuccessAnimation(true)
      
    } catch (error) {
      console.error('Logout error:', error)
      setShowLoadingOverlay(false)
      setShowSuccessAnimation(false) // Reset success animation on error
      
      toast({
        title: '❌ Sign out failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false)
    // Reset all states when success animation completes
    setShowLogoutConfirm(false)
    setShowLoadingOverlay(false)
    setLoading(false)
    setOpen(false)
    
    // Redirect to logout page for complete cleanup
    router.push('/logout')
  }

  // Reset states when user changes (e.g., after logout/login)
  useEffect(() => {
    if (!user) {
      setShowLogoutConfirm(false)
      setShowLoadingOverlay(false)
      setShowSuccessAnimation(false)
      setLoading(false)
      setOpen(false)
    }
  }, [user])

  if (!user) return null

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        id="account-menu-button"
        variant="ghost"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // If logout confirmation is open, close it
          if (showLogoutConfirm) {
            setShowLogoutConfirm(false)
            return
          }
          
          // Toggle dropdown
          setOpen(prev => !prev)
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User account menu"
        className="flex items-center space-x-2"
        type="button"
      >
        <div
          aria-label="User avatar"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold text-gray-600 overflow-hidden"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={`${user.email ?? 'user'} avatar`}
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            getInitials(user.email ?? '')
          )}
        </div>
        <span className="hidden sm:inline">
          {internalUserData?.user?.name || user.user_metadata?.name || user.email?.split('@')[0]}
        </span>
      </Button>

      {open && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[60]"
          onClick={(e) => e.stopPropagation()}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="account-menu-button"
        >
          <div className="p-4 border-b">
            <p className="font-semibold">
              {internalUserData?.user?.name || user.user_metadata?.name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {lastLogin && (
              <p className="mt-1 text-xs text-gray-400">
                Last login: <time dateTime={lastLogin}>{lastLogin}</time>
              </p>
            )}
            {userRole && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                Role: {userRole}
              </span>
            )}
          </div>

          <nav className="flex flex-col divide-y">
            {/* Admin Navigation (if admin and not loading) */}
            {isAdmin && !isAdminLoading && (
              <div className="py-2">
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin Panel
                  </h4>
                </div>
                {ADMIN_NAV_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpen(false)
                    }}
                    aria-label={label}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Regular User Navigation */}
            <div className={isAdmin ? "pt-2" : ""}>
              {isAdmin && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    My Account
                  </h4>
                </div>
              )}
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-3 hover:bg-gray-100 text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                  }}
                  aria-label={label}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowLogoutConfirm(true)
              }}
              disabled={loading}
              type="button"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal - Render outside dropdown */}
      {showLogoutConfirm && (
        <LogoutConfirmation
          isOpen={showLogoutConfirm}
          onClose={() => {
            setShowLogoutConfirm(false)
          }}
          onConfirm={handleLogout}
          userEmail={user.email}
          isLoading={loading}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showLoadingOverlay}
        type="logout"
      />

      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showSuccessAnimation}
        type="logout"
        onComplete={handleSuccessComplete}
      />
    </div>
  )
}