import { Suspense } from 'react'
import PageLayout from "@/components/common/page-layout"
import LoginServer from "@/components/auth/login-server"
import LoginSkeleton from "@/components/auth/login-skeleton"

// Enable static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 86400 // Revalidate every 24 hours

export default function LoginPage() {
  return (
    <PageLayout>
      <Suspense fallback={<LoginSkeleton />}>
        <LoginServer />
      </Suspense>
    </PageLayout>
  )
}