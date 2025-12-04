import { Skeleton } from '@/components/ui/skeleton'

export default function TermsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <section key={i} className="space-y-4">
            <Skeleton className="h-8 w-80" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </section>
        ))}
      </div>

      {/* Last Updated */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}
