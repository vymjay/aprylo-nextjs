import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface ApiError {
  message: string
  status?: number
  code?: string
}

/**
 * Global error handling hook for API operations
 * Provides consistent error handling across the application
 */
export function useApiErrorHandler() {
  const { toast } = useToast()
  const router = useRouter()

  const handleError = (error: any, customMessage?: string) => {
    console.error('API Error:', error)

    let errorMessage = customMessage || 'An unexpected error occurred'
    let shouldRedirect = false

    // Handle different types of errors
    if (error?.message) {
      errorMessage = error.message
    }

    if (error?.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'You need to log in to perform this action'
          shouldRedirect = true
          break
        case 403:
          errorMessage = 'You do not have permission to perform this action'
          break
        case 404:
          errorMessage = 'The requested resource was not found'
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later'
          break
        case 500:
          errorMessage = 'Server error. Please try again later'
          break
        default:
          if (error.status >= 400 && error.status < 500) {
            errorMessage = 'There was a problem with your request'
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later'
          }
      }
    }

    // Show toast notification
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    })

    // Redirect if necessary (e.g., for authentication errors)
    if (shouldRedirect) {
      router.push('/login')
    }

    return errorMessage
  }

  const handleNetworkError = () => {
    toast({
      title: 'Network Error',
      description: 'Please check your internet connection and try again',
      variant: 'destructive',
    })
  }

  const handleValidationError = (validationErrors: Record<string, string[]>) => {
    const errorMessages = Object.entries(validationErrors)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('\n')

    toast({
      title: 'Validation Error',
      description: errorMessages,
      variant: 'destructive',
    })
  }

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
  }
}

/**
 * Error retry utilities
 */
export function useErrorRetry() {
  const { toast } = useToast()

  const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`)
      }
    }

    throw lastError
  }

  const retryWithToast = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    operationName: string = 'operation'
  ): Promise<T> => {
    try {
      return await withRetry(operation, maxRetries)
    } catch (error) {
      toast({
        title: 'Operation Failed',
        description: `Failed to ${operationName} after ${maxRetries} attempts`,
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    withRetry,
    retryWithToast,
  }
}
