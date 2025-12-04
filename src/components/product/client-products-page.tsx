'use client';

import { useState } from 'react';
import { Product } from '@/types';
import InfiniteProductGrid from '@/components/product/infinite-product-grid';
import { useInfiniteProducts } from '@/hooks/api/use-products';

interface ClientProductsPageProps {
  initialProducts: Product[];
  category?: string;
  search?: string;
}

export default function ClientProductsPage({ 
  initialProducts, 
  category, 
  search 
}: ClientProductsPageProps) {
  // Use the infinite products hook instead of manual fetching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteProducts({
    category,
    search,
    limit: 20,
  })

  // Get all products from pages
  const allProducts = data?.pages.flatMap(page => page) || []
  
  // Use the hook's loadMore function
  const loadMoreProducts = async (): Promise<Product[]> => {
    if (hasNextPage && !isFetchingNextPage) {
      const result = await fetchNextPage()
      return result.data?.pages[result.data.pages.length - 1] || []
    }
    return []
  };

  return (
    <InfiniteProductGrid
      initialProducts={allProducts.length > 0 ? allProducts : initialProducts}
      hasMore={hasNextPage}
      onLoadMore={loadMoreProducts}
      category={category}
      search={search}
    />
  );
}
