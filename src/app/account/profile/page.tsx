import { Suspense } from 'react'
import PageLayout from "@/components/common/page-layout"
import ProfileServer from "@/components/account/profile/profile-server"
import ProfileSkeleton from "@/components/account/profile/profile-skeleton"
import AuthGuard from "@/components/common/auth-guard"

// Enable dynamic rendering for user-specific content
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
    return (
        <AuthGuard>
            <PageLayout>
                <Suspense fallback={<ProfileSkeleton />}>
                    <ProfileServer />
                </Suspense>
            </PageLayout>
        </AuthGuard>
    )
}