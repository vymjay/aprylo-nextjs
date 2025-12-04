import { Suspense } from 'react'
import AuthGuard from "@/components/common/auth-guard"
import PageLayout from "@/components/common/page-layout"
import OrdersServer from "@/components/orders/orders-server"
import OrdersSkeleton from "@/components/orders/orders-skeleton"

// Enable dynamic rendering for user-specific content
export const dynamic = 'force-dynamic'

export default function OrdersPage() {
    return (
        <AuthGuard>
            <PageLayout>
                <Suspense fallback={<OrdersSkeleton />}>
                    <OrdersServer />
                </Suspense>
            </PageLayout>
        </AuthGuard>
    )
}