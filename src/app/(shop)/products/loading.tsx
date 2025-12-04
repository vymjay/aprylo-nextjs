import ProductsListSkeleton from '@/components/product/products-list-skeleton'
import BackButton from '@/components/common/back-button'

export default function Loading() {
  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="h-8 bg-gray-200 animate-pulse rounded mb-2 w-80"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-96"></div>
        </div>

        <ProductsListSkeleton />
      </div>
    </div>
  )
}
