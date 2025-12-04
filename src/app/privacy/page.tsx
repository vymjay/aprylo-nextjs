import { Suspense } from 'react'
import PrivacyServer from "@/components/privacy/privacy-server"
import PrivacySkeleton from "@/components/privacy/privacy-skeleton"
import PageLayout from "@/components/common/page-layout"

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function PrivacyPage() {
  return (
    <PageLayout>
      <Suspense fallback={<PrivacySkeleton />}>
        <PrivacyServer />
      </Suspense>
    </PageLayout>
  )
}