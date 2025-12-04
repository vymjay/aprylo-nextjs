import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

export default function ErrorDisplay({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  showRetry = true 
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="mb-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}