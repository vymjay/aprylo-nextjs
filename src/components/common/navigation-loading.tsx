'use client'

import { Loader2 } from "lucide-react"

interface NavigationLoadingProps {
  message?: string
}

export default function NavigationLoading({ message = "Loading products..." }: NavigationLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          <p className="text-sm text-gray-500 mt-1">Please wait while we load your content</p>
        </div>
      </div>
    </div>
  )
}
