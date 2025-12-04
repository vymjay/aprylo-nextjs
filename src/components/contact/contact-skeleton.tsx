import { Skeleton } from '@/components/ui/skeleton'

export default function ContactSkeleton() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Skeleton className="h-9 w-48" />

      {/* Contact Form */}
      <div className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Submit Button */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Contact Information */}
      <div className="mt-12 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    </main>
  )
}
