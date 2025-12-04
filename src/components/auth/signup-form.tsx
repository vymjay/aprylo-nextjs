'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const { signup } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and Confirm Password must be the same.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(email, password, name)
      if (result.success) {
        if (result.needsConfirmation) {
          setNeedsConfirmation(true)
          toast({
            title: "Check your email",
            description: "A confirmation email has been sent. Please confirm your email before logging in.",
          })
        } else {
          toast({
            title: "Account created!",
            description: "You can now log in to your account.",
          })
          router.push('/login')
        }
      } else {
        // If error message includes 'already registered', show custom toast
        if (result.message?.toLowerCase().includes('already registered')) {
          toast({
            title: "Email already registered",
            description: "Please use a different email or login instead.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Signup failed",
            description: result.message || "Unable to create account",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Confirm your email</h2>
        <p className="mb-4">
          We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
        </p>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="mt-1">
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </Button>
      </div>
    </form>
  )
}