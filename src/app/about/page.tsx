import { Suspense } from 'react'
import PageLayout from "@/components/common/page-layout"
import AboutServer from "@/components/about/about-server"
import AboutSkeleton from "@/components/about/about-skeleton"

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function AboutPage() {
  return (
    <PageLayout>
      <Suspense fallback={<AboutSkeleton />}>
        <AboutServer />
      </Suspense>
    </PageLayout>
  )
}