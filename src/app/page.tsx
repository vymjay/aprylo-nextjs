'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')  // Redirect from '/' to '/home' automatically
  }, [router])

  return null // or loading spinner if you want
}