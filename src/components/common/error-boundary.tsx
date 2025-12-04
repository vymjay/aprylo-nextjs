'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logError } from '@/lib/logger'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props

    // Log error with context
    logError(`[${level.toUpperCase()}] Error Boundary Caught`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
    })

    this.setState({
      errorInfo
    })

    // Call custom error handler
    onError?.(error, errorInfo)

    // Auto-retry for component-level errors after 5 seconds
    if (level === 'component') {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary()
      }, 5000)
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, i) => key !== prevProps.resetKeys?.[i])) {
        this.resetErrorBoundary()
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  public render() {
    const { hasError, error, errorId } = this.state
    const { children, fallback, level = 'component' } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different error UIs based on level
      if (level === 'critical') {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-6">
                A critical error occurred that prevented the application from loading properly.
              </p>
              <div className="space-y-3">
                <Button onClick={this.reloadPage} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>
                <Button variant="outline" onClick={this.goHome} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      }

      if (level === 'page') {
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Error
            </h2>
            <p className="text-gray-600 mb-6">
              Something went wrong loading this page.
            </p>
            <div className="space-x-4">
              <Button onClick={this.resetErrorBoundary}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={this.goHome}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
            {errorId && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {errorId}
              </p>
            )}
          </div>
        )
      }

      // Component-level error
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-2">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Component Error
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This component encountered an error and couldn't load.
              </p>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={this.resetErrorBoundary}
                  className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
              {errorId && (
                <p className="text-xs text-yellow-600 mt-2">
                  Error ID: {errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary

// Convenience components for different error levels
export const PageErrorBoundary = ({ children, ...props }: Omit<Props, 'level'>) => (
  <ErrorBoundary level="page" {...props}>
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary = ({ children, ...props }: Omit<Props, 'level'>) => (
  <ErrorBoundary level="component" {...props}>
    {children}
  </ErrorBoundary>
)

export const CriticalErrorBoundary = ({ children, ...props }: Omit<Props, 'level'>) => (
  <ErrorBoundary level="critical" {...props}>
    {children}
  </ErrorBoundary>
)
