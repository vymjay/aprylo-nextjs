import PageLayout from "@/components/common/page-layout"
import React from "react"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <PageLayout>
      <div className="flex flex-col pt-8 pb-2 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center">
            <h2 className="text-3xl font-bold text-primary">Aprylo</h2>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w">
            Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <ForgotPasswordForm />

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Remembered your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}