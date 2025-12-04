import { Suspense } from 'react'
import SignupServer from '@/components/auth/signup-server'
import SignupSkeleton from '@/components/auth/signup-skeleton'
import PageLayout from '@/components/common/page-layout'

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function SignupPage() {
  return (
    <PageLayout>
      <Suspense fallback={<SignupSkeleton />}>
        <SignupServer />
      </Suspense>
    </PageLayout>
  )
}