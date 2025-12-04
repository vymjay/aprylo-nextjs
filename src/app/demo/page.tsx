import { Suspense } from 'react'
import DemoServer from '@/components/demo/demo-server'
import DemoSkeleton from '@/components/demo/demo-skeleton'

// Enable dynamic rendering for interactive demo
export const dynamic = 'force-dynamic'

export default function DemoPage() {
  return (
    <Suspense fallback={<DemoSkeleton />}>
      <DemoServer />
    </Suspense>
  )
}
