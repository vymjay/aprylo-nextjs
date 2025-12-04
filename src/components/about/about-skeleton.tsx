import { Skeleton } from '@/components/ui/skeleton'

export default function AboutSkeleton() {
  return (
    <main className="my-10 max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
      {/* Main Title */}
      <div className="mb-6 pb-2 border-b-4 border-pink-500">
        <Skeleton className="h-10 w-80" />
      </div>

      {/* Main Description */}
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-4/5 mb-8" />

      {/* First Section */}
      <section className="mb-8 space-y-4">
        <div className="border-l-4 border-pink-500 pl-4">
          <Skeleton className="h-8 w-96" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </section>

      {/* Second Section */}
      <section className="space-y-4">
        <div className="border-l-4 border-pink-500 pl-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </section>
    </main>
  )
}
