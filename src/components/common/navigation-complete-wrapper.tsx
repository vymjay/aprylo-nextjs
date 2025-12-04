'use client'

import { useNavigationComplete } from '@/hooks/use-navigation-complete'

interface NavigationCompleteWrapperProps {
  children: React.ReactNode
}

export default function NavigationCompleteWrapper({ children }: NavigationCompleteWrapperProps) {
  useNavigationComplete()
  
  return <>{children}</>
}
