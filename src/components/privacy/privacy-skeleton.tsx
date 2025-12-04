import { Skeleton } from '@/components/ui/skeleton'

export default function PrivacySkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <section key={i} className="space-y-4">
            <Skeleton className="h-8 w-72" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </section>
        ))}
      </div>

      {/* Contact Information */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}
