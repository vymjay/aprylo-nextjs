// Dynamic base URL - handle both client and server environments
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client side - use current window location
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Server side - use environment variable or dynamic port detection
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Check for development environment with custom port
  if (process.env.NODE_ENV === 'development') {
    // Try to detect the actual port from process.env or use default
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3000';
    return `http://localhost:${port}`;
  }
  
  // Default for server-side rendering
  return 'http://localhost:3000';
};

interface FetchOptions extends RequestInit {
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export async function fetcher<T>(path: string, options: FetchOptions = {}): Promise<T> {
  let fullUrl = '';
  try {
    // For absolute URLs, use as is, otherwise construct full URL
    fullUrl = path.startsWith('http') ? path : `${getBaseURL()}${path}`;

    // Use provided revalidate value or default to 60 seconds for better responsiveness
    const revalidateValue = options.next?.revalidate !== undefined ? options.next.revalidate : 60;

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    };

    // Add Next.js specific options if available
    if (typeof window === 'undefined') {
      // Server-side only - add Next.js cache options
      (fetchOptions as any).next = { 
        revalidate: revalidateValue,
        ...options.next 
      };
    }

    const response = await fetch(fullUrl, fetchOptions).catch((fetchError) => {
      try {
        const logData = {
          url: fullUrl,
          error: fetchError,
          message: fetchError?.message,
          name: fetchError?.name,
          cause: fetchError?.cause
        };
        
        if (typeof console !== 'undefined') {
          if (console.warn) {
            console.warn('Fetch error:', logData);
          } else if (console.log) {
            console.log('Fetch error:', logData);
          }
        }
      } catch (logError) {
        // Silent fail if logging fails
      }
      throw fetchError;
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        const errorMessage = error.message || `HTTP error! status: ${response.status}`;
        
        // Safe logging to avoid circular reference issues
        try {
          // Use a safer logging approach
          const logData = {
            status: response.status,
            statusText: response.statusText,
            url: fullUrl,
            errorMessage: errorMessage,
            errorData: JSON.stringify(error, null, 2)
          };
          
          // Try different logging methods in order of preference
          if (typeof console !== 'undefined') {
            if (console.warn) {
              console.warn('API Error Response:', logData);
            } else if (console.log) {
              console.log('API Error Response:', logData);
            }
          }
        } catch (logError) {
          // Silent fail if all logging fails
        }
        
        throw new Error(errorMessage);
      } else {
        const text = await response.text();
        
        // Safe logging for non-JSON responses
        try {
          const logData = {
            status: response.status,
            statusText: response.statusText,
            url: fullUrl,
            responseText: text.substring(0, 500) // Limit text length
          };
          
          if (typeof console !== 'undefined') {
            if (console.warn) {
              console.warn('Non-JSON error response:', logData);
            } else if (console.log) {
              console.log('Non-JSON error response:', logData);
            }
          }
        } catch (logError) {
          // Silent fail if all logging fails
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      try {
        if (typeof console !== 'undefined') {
          if (console.warn) {
            console.warn('Unexpected response type:', contentType, 'Response:', text);
          } else if (console.log) {
            console.log('Unexpected response type:', contentType, 'Response:', text);
          }
        }
      } catch (logError) {
        // Silent fail if logging fails
      }
      throw new Error('Server responded with non-JSON content');
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No data received');
    }

    return data;
  } catch (error: any) {
    // Safe error logging to avoid circular references
    try {
      const errorInfo = {
        message: error?.message || 'Unknown error',
        name: error?.name || 'Unknown error type',
        type: typeof error,
        originalPath: path,
        fullUrl,
        isError: error instanceof Error,
        isTypeError: error instanceof TypeError,
        isReferenceError: error instanceof ReferenceError,
        errorString: String(error)
      };
      
      if (typeof console !== 'undefined') {
        if (console.warn) {
          console.warn(`Error fetching ${path}:`, errorInfo);
        } else if (console.log) {
          console.log(`Error fetching ${path}:`, errorInfo);
        }
      }
    } catch (logError) {
      // Silent fail if all logging fails
    }
    
    throw error;
  }
}
