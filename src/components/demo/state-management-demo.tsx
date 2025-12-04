'use client'

import { useCategories, useProducts, useCurrentUser, useCacheInvalidation } from '@/hooks/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

/**
 * Demo component showing the new state management system
 * This demonstrates how multiple API calls are eliminated through caching
 */
export default function StateManagementDemo() {
  // These hooks will automatically cache and share data
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: products = [], isLoading: productsLoading } = useProducts({ limit: 5 })
  const { data: user, isLoading: userLoading } = useCurrentUser()
  
  // Cache management utilities
  const { invalidateCategories, invalidateProducts, invalidateAll } = useCacheInvalidation()

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">State Management Demo</h1>
        <p className="text-gray-600 mt-2">
          This page demonstrates the new centralized state management system.
          Check the Network tab - you'll see minimal API calls due to intelligent caching!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Categories
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => invalidateCategories()}
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="text-sm p-2 bg-gray-50 rounded">
                    {category.name}
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Cached for 15 minutes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Products
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => invalidateProducts()}
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-gray-600">{formatPrice(product.price)}</div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Cached for 5 minutes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Session</CardTitle>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="text-sm p-2 bg-green-50 rounded">
                  <div className="font-medium">Logged in</div>
                  <div className="text-gray-600">{user.email}</div>
                </div>
                <p className="text-xs text-gray-500">
                  Cached for 5 minutes
                </p>
              </div>
            ) : (
              <div className="text-sm p-2 bg-gray-50 rounded">
                Not logged in
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              These buttons demonstrate manual cache invalidation. 
              Notice how data refreshes instantly when cached, or shows loading when cache is invalidated.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => invalidateCategories()}
              >
                Invalidate Categories
              </Button>
              <Button 
                variant="outline" 
                onClick={() => invalidateProducts()}
              >
                Invalidate Products
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => invalidateAll()}
              >
                Clear All Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Categories API called once, shared across all components</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Products data cached and reused</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>User session persistent across navigation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Automatic background refetching keeps data fresh</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Optimistic updates for instant user feedback</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Multiple instances of this component to demonstrate data sharing
 */
export function CategoriesWidget() {
  const { data: categories = [], isLoading } = useCategories()
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Categories Widget</h3>
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="text-sm">
          {categories.length} categories loaded (shared cache)
        </div>
      )}
    </div>
  )
}

export function ProductsWidget() {
  const { data: products = [], isLoading } = useProducts({ limit: 3 })
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Products Widget</h3>
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="text-sm">
          {products.length} products loaded (shared cache)
        </div>
      )}
    </div>
  )
}
