import { useEffect, useRef, useCallback, useState } from 'react'

interface SearchWorkerMessage {
  type: string
  data?: any
  error?: string
  searchId: number
  fromCache?: boolean
}

interface UseSearchWorkerOptions {
  onSuccess?: (data: any, fromCache: boolean) => void
  onError?: (error: string) => void
  onLoading?: () => void
}

export function useSearchWorker(options: UseSearchWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null)
  const [isWorkerReady, setIsWorkerReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchIdRef = useRef(0)
  const pendingSearches = useRef(new Map())
  
  // Stabilize callback references to prevent infinite re-renders
  const onSuccessRef = useRef(options.onSuccess)
  const onErrorRef = useRef(options.onError)
  const onLoadingRef = useRef(options.onLoading)
  
  // Update refs when options change
  useEffect(() => {
    onSuccessRef.current = options.onSuccess
    onErrorRef.current = options.onError
    onLoadingRef.current = options.onLoading
  }, [options.onSuccess, options.onError, options.onLoading])

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        workerRef.current = new Worker('/search-worker.js')
        
        workerRef.current.onmessage = (e: MessageEvent<SearchWorkerMessage>) => {
          const { type, data, error, searchId, fromCache } = e.data
          
          switch (type) {
            case 'WORKER_READY':
              setIsWorkerReady(true)
              break
              
            case 'SEARCH_LOADING':
              setIsLoading(true)
              onLoadingRef.current?.()
              break
              
            case 'SEARCH_SUCCESS':
              setIsLoading(false)
              if (pendingSearches.current.has(searchId)) {
                pendingSearches.current.delete(searchId)
                onSuccessRef.current?.(data, fromCache || false)
              }
              break
              
            case 'SEARCH_ERROR':
              setIsLoading(false)
              if (pendingSearches.current.has(searchId)) {
                pendingSearches.current.delete(searchId)
                onErrorRef.current?.(error || 'Search failed')
              }
              break
              
            case 'CACHE_CLEARED':
              console.log('Search cache cleared')
              break
          }
        }
        
        workerRef.current.onerror = (error) => {
          console.error('Search worker error:', error)
          setIsWorkerReady(false)
          onErrorRef.current?.('Worker failed to initialize')
        }
        
      } catch (error) {
        console.error('Failed to initialize search worker:', error)
        setIsWorkerReady(false)
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const search = useCallback((query: string, limit?: number) => {
    if (!workerRef.current || !isWorkerReady) {
      onErrorRef.current?.('Search worker not ready')
      return
    }
    
    if (!query || query.length < 2) {
      onSuccessRef.current?.([], false)
      return
    }
    
    const searchId = ++searchIdRef.current
    pendingSearches.current.set(searchId, true)
    
    workerRef.current.postMessage({
      type: 'SEARCH_PRODUCTS',
      payload: { query, limit },
      searchId
    })
  }, [isWorkerReady]) // Remove options dependency

  const clearCache = useCallback(() => {
    if (workerRef.current && isWorkerReady) {
      workerRef.current.postMessage({
        type: 'CLEAR_CACHE',
        searchId: ++searchIdRef.current
      })
    }
  }, [isWorkerReady])

  return {
    search,
    clearCache,
    isWorkerReady,
    isLoading
  }
}
