export default function BillingSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="p-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-b-0">
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                            </div>
                            <div className="flex-1 text-right">
                                <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
