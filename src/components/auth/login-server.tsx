import LoginForm from './login-form'
import Link from 'next/link'

export default function LoginServer() {
  return (
    <div className="flex flex-col pt-8 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h2 className="text-3xl font-bold text-primary">Aprylo</h2>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
