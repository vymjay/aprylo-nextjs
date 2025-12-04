import { Suspense } from 'react'
import PageLayout from "@/components/common/page-layout"
import ContactServer from "@/components/contact/contact-server"
import ContactSkeleton from "@/components/contact/contact-skeleton"

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function ContactPage() {
  return (
    <PageLayout>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactServer />
      </Suspense>
    </PageLayout>
  )
}