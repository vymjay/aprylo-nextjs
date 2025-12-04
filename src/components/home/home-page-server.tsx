import { createPublicClient } from '@/lib/supabase/api-client'
import SimpleHeroSection from "./simple-hero-section"
import LazyCategoriesSection from "./lazy-categories-section"
import LazyFeaturedProducts from "./lazy-featured-products"
import ErrorDisplay from "../common/error-display"
import { Category, Product } from '@/types'

async function getHomePageData() {
  try {
    const { supabase } = await createPublicClient()
    
    // Fetch categories and featured products in parallel
    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from("Category")
        .select("id, name, slug, description, image")
        .order("id", { ascending: true }),
      supabase
        .from("Product")
        .select(`*, category:categoryId (id, name, slug)`)
        .order("title", { ascending: true })
        .limit(8)
    ])

    return {
      categories: categoriesResult.data || [],
      products: productsResult.data || [],
      error: categoriesResult.error || productsResult.error
    }
  } catch (error) {
    console.error('Failed to fetch home page data:', error)
    return {
      categories: [],
      products: [],
      error: error as Error
    }
  }
}

export default async function HomePageServer() {
  const { categories, products, error } = await getHomePageData()

  if (error) {
    return (
      <div className="container py-12">
        <ErrorDisplay 
          title="Failed to load homepage"
          message="We couldn't load the homepage content. Please try refreshing the page."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SimpleHeroSection />
      <LazyCategoriesSection categories={categories as Category[]} />
      <LazyFeaturedProducts products={products as Product[]} />
    </div>
  )
}
