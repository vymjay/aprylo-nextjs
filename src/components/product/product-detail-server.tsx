import { getProductById } from '@/lib/data/products'
import ProductDetails from '@/components/product/product-detail'
import LazyReviewSection from '@/components/product/review/lazy-review-section'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ErrorDisplay from '../common/error-display'

interface ProductDetailServerProps {
  productId: string
}

async function getProductData(productId: string) {
  try {
    // Create Supabase client with cookies store
    const supabase = createServerComponentClient({ 
      cookies 
    });
    
    // Check auth state and fetch product data in parallel
    const [authResult, product] = await Promise.all([
      supabase.auth.getSession(),
      getProductById(productId)
    ]);

    return {
      product,
      isLoggedIn: !!authResult.data?.session,
      error: null
    }
  } catch (error) {
    console.error('Failed to fetch product data:', error)
    return {
      product: null,
      isLoggedIn: false,
      error: error as Error
    }
  }
}

export default async function ProductDetailServer({ productId }: ProductDetailServerProps) {
  const { product, isLoggedIn, error } = await getProductData(productId)

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorDisplay
          title="Error loading product"
          message="There was an error loading the product. Please try again later."
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="mt-2 text-gray-600">The product you're looking for could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProductDetails product={product} />
      <LazyReviewSection productId={product.id} isLoggedIn={isLoggedIn} />
    </div>
  )
}
