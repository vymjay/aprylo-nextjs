'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '../ui/button'

export default function BackButton() {
  const router = useRouter()

  return (
    <div className="mb-4">
      <Button type="submit" onClick={() => router.push('/home') } variant="outline" className="flex items-center gap-2">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Home
      </Button>
    </div>
  )
}