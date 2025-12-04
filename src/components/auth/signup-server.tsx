import SignupForm from './signup-form'
import Link from 'next/link'

export default function SignupServer() {
  return (
    <div className="flex flex-col pt-8 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h2 className="text-3xl font-bold text-primary">VB Cart</h2>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignupForm />

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
