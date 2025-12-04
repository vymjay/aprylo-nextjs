'use client'

import React from 'react'
import PageLayout from '@/components/common/page-layout'
import ChangePasswordForm from '@/components/auth/change-password-form'
import AuthGuard from '@/components/common/auth-guard'

export default function ChangePasswordPage() {
    return (
        <AuthGuard>
            <PageLayout>
                <div className="flex flex-col pt-8 pb-2 px-4 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                            Change your password
                        </h2>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <ChangePasswordForm />
                        </div>
                    </div>
                </div>
            </PageLayout>
        </AuthGuard>
    )
}