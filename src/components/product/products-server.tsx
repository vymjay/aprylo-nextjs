import { getProducts } from '@/lib/data/products'
import ClientProductsPage from '@/components/product/client-products-page'
import ErrorDisplay from '../common/error-display'

interface ProductsServerProps {
  category?: string
  search?: string
}

async function getProductsData(params: { category?: string; search?: string }) {
  try {
    const products = await getProducts({ 
      category: params.category, 
      search: params.search, 
      limit: 20 
    })

    return {
      products,
      error: null
    }
  } catch (error) {
    console.error('Failed to fetch products data:', error)
    return {
      products: [],
      error: error as Error
    }
  }
}

export default async function ProductsServer({ category, search }: ProductsServerProps) {
  const { products, error } = await getProductsData({ category, search })

  if (error) {
    return (
      <ErrorDisplay
        title="Error loading products"
        message="There was an error loading the products. Please try again later."
      />
    )
  }

  return (
    <ClientProductsPage 
      initialProducts={products}
      category={category}
      search={search}
    />
  )
}
