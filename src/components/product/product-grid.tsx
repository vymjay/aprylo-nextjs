import { Product } from '@/types'
import LazyProductCard from './lazy-product-card'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          Try adjusting your search or browse our categories.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <LazyProductCard 
          key={product.id} 
          product={product} 
          index={index}
          delay={index * 50}
        />
      ))}
    </div>
  )
}