import { Suspense } from 'react'
import BackButton from '@/components/common/back-button'
import ProductDetailServer from '@/components/product/product-detail-server'
import ProductDetailSkeleton from '@/components/product/product-detail-skeleton'

// Enable static generation for better performance
export const dynamic = 'force-dynamic' // Product details need to be dynamic for auth state
export const revalidate = 300 // Revalidate every 5 minutes

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  if (!id) {
    return (
      <div className="bg-gray-50 px-4 py-6 min-h-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <BackButton />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Invalid Product</h1>
            <p className="mt-2 text-gray-600">Product ID is required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton />
      </div>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailServer productId={id} />
      </Suspense>
    </div>
  );
}