'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SearchInput() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialSearch = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchTerm(value)

    const params = new URLSearchParams(Array.from(searchParams.entries()))

    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={onChange}
      className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
    />
  )
}