'use client'

import React, { ReactNode } from "react"
import BackButton from "@/components/common/back-button"

type PageLayoutProps = {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <BackButton />
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}