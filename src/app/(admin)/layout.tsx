'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import Loading from '@/components/common/loading'
import { toast } from '@/hooks/use-toast'

async function checkAdminAccess(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/admin-check')
    if (!response.ok) {
      return false
    }
    const data = await response.json()
    return data.isAdmin
  } catch (error) {
    console.error('Admin check failed:', error)
    return false
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please login to access the admin panel",
        variant: "destructive"
      })
      router.push('/auth/login?redirect=/admin')
      return
    }

    // Check if user is admin
    const verifyAdminAccess = async () => {
      try {
        const adminStatus = await checkAdminAccess()
        setIsAdmin(adminStatus)
        
        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel",
            variant: "destructive"
          })
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        toast({
          title: "Error",
          description: "Failed to verify admin access",
          variant: "destructive"
        })
        router.push('/')
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    verifyAdminAccess()
  }, [user, isLoading, router])

  if (isLoading || isCheckingAdmin) {
    return <Loading />
  }

  if (!user || !isAdmin) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
