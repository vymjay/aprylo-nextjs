'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access_token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!accessToken) {
      toast({
        title: 'Invalid or expired link',
        description: 'No access token found. Please request a new password reset.',
        variant: 'destructive',
      })
      router.push('/login')
    }
  }, [accessToken, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // @ts-ignore: accessToken option accepted but not typed yet
      const { error } = await supabase.auth.updateUser({ password }, { accessToken })

      if (error) {
        toast({
          title: 'Failed to reset password',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Password reset successful',
          description: 'You can now log in with your new password.',
        })
        router.push('/login')
      }
    } catch (err) {
      toast({
        title: 'Unexpected error',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Reset Password'}
      </Button>
    </form>
  )
}