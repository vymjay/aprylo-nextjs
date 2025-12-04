'use client';

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
  onLoad?: (metrics: {
    loadTime: number;
    componentName: string;
    timestamp: number;
  }) => void;
}

export default function PerformanceMonitor({ 
  componentName, 
  onLoad 
}: PerformanceMonitorProps) {
  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor when component is loaded
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      const metrics = {
        loadTime,
        componentName,
        timestamp: Date.now(),
      };
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Lazy Load Metrics - ${componentName}:`, {
          'Load Time': `${loadTime.toFixed(2)}ms`,
          'Component': componentName,
        });
      }
      
      // Call custom callback if provided
      onLoad?.(metrics);
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // Example: Send to Google Analytics or other analytics service
        const gtag = (window as any).gtag;
        if (gtag) {
          gtag('event', 'lazy_load', {
            event_category: 'performance',
            event_label: componentName,
            value: Math.round(loadTime),
          });
        }
      }
    };

    // Use RAF to ensure DOM is ready
    requestAnimationFrame(handleLoad);
    
    return () => {
      // Cleanup if needed
    };
  }, [componentName, onLoad]);

  return null; // This component doesn't render anything
}

// Hook version for easier usage
export function useLazyLoadMetrics(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Component Unmount - ${componentName}: ${loadTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

// Global performance observer for lazy loading
export function initializeLazyLoadObserver() {
  if (typeof window === 'undefined') return;
  
  // Observe Largest Contentful Paint for lazy-loaded content
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('📊 LCP (Lazy Load Impact):', entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Clean up observer after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
}
