'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function ChangePasswordForm() {
  const { user, login, changePassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) {
      toast({ title: 'User not logged in', variant: 'destructive' })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password should be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    if (!currentPassword) {
      toast({ title: 'Current password is required', variant: 'destructive' })
      return
    }

    setIsLoading(true)

    try {
      // Verify current password by trying to login
      const loginResult = await login(user.email, currentPassword)
      if (!loginResult.success) {
        toast({ title: 'Current password is incorrect', variant: 'destructive' })
        setIsLoading(false)
        return
      }

      // Change password
      const changeResult = await changePassword(newPassword)
      if (changeResult.success) {
        toast({
          title: 'Password changed successfully',
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        // Navigate home
        router.push('/home')
      } else {
        toast({
          title: 'Failed to change password',
          description: changeResult.message || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <Input
          id="current-password"
          type="password"
          required
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
        />
      </div>

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <Input
          id="new-password"
          type="password"
          required
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <Input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Changing...' : 'Change Password'}
      </Button>
    </form>
  )
}