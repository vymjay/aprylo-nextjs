import { Skeleton } from '@/components/ui/skeleton'

export default function SignupSkeleton() {
  return (
    <div className="flex flex-col pt-8 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="mt-6 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
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

          {/* Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <Skeleton className="h-4 w-4 mt-1 mr-3" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Sign Up Button */}
          <Skeleton className="h-12 w-full" />

          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Links */}
          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
