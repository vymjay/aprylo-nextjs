
import { Suspense } from 'react'
import ProductsServer from '@/components/product/products-server'
import ProductsListSkeleton from '@/components/product/products-list-skeleton'
import BackButton from '@/components/common/back-button'

// Enable dynamic rendering for real-time category filtering
export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const category =
    typeof resolvedSearchParams.category === 'string'
      ? resolvedSearchParams.category
      : undefined
  const search =
    typeof resolvedSearchParams.search === 'string'
      ? resolvedSearchParams.search
      : undefined

  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
              : search
              ? `Search Results for "${search}"`
              : 'All Products'}
          </h1>
          {/* Search input removed since we have global search in header */}
        </div>

        <Suspense fallback={<ProductsListSkeleton />}>
          <ProductsServer 
            category={category}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  )
}