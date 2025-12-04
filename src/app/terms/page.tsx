import { Suspense } from 'react'
import PageLayout from "@/components/common/page-layout"
import TermsServer from "@/components/terms/terms-server"
import TermsSkeleton from "@/components/terms/terms-skeleton"

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function TermsOfServicePage() {
  return (
    <PageLayout>
      <Suspense fallback={<TermsSkeleton />}>
        <TermsServer />
      </Suspense>
    </PageLayout>
  )
}