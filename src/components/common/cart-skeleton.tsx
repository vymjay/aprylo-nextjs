import { Skeleton } from '@/components/ui/skeleton'

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0">
                {/* Product Image */}
                <Skeleton className="w-20 h-20 rounded-lg" />
                
                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-6" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>

                {/* Price and Remove */}
                <div className="flex flex-col items-end space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between font-semibold border-t pt-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Checkout Button */}
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
