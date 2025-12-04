import { Suspense } from 'react'
import PageLayout from '@/components/common/page-layout'
import AuthGuard from '@/components/common/auth-guard'
import CartServer from '@/components/common/cart-server'
import CartSkeleton from '@/components/common/cart-skeleton'

// Enable dynamic rendering for user-specific cart content
export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <AuthGuard>
      <PageLayout>
        <Suspense fallback={<CartSkeleton />}>
          <CartServer />
        </Suspense>
      </PageLayout>
    </AuthGuard>
  )
}