import StateManagementDemo, { CategoriesWidget, ProductsWidget } from './state-management-demo'

export default function DemoServer() {
  return (
    <div>
      <StateManagementDemo />
      
      {/* Multiple widgets to demonstrate data sharing */}
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Data Sharing Demonstration
        </h2>
        <p className="text-center text-gray-600 mb-6">
          These widgets use the same API hooks. Notice they share cached data without additional API calls.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <CategoriesWidget />
          <ProductsWidget />
        </div>
      </div>
    </div>
  )
}
