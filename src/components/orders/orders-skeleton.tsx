import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersSkeleton() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Skeleton className="h-9 w-48" />
      
      {/* Order Cards */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-md p-4 shadow-sm space-y-4">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Order Status */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Stepper */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                {Array.from({ length: 4 }).map((_, step) => (
                  <div key={step} className="flex flex-col items-center space-y-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
