import { Suspense } from 'react'
import { Metadata } from 'next'
import HomePageServer from '@/components/home/home-page-server'
import Loading from '@/components/common/loading'

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'Home | VB Cart - Premium Fashion Store',
  description: 'Discover the latest fashion trends with VB Cart. Premium designer clothing for men, women, and children.',
  other: {
    // Preload critical category images for faster loading
    'preload-men': 'link rel="preload" href="/models/optimized/men-800.jpg" as="image" fetchpriority="high"',
    'preload-women': 'link rel="preload" href="/models/optimized/women-800.jpg" as="image" fetchpriority="high"',
    'preload-children': 'link rel="preload" href="/models/optimized/children-800.jpg" as="image"',
  }
}

export default function HomePage() {
  return (
    <div className="bg-white">
      <Suspense fallback={<Loading />}>
        <HomePageServer />
      </Suspense>
    </div>
  )
}
