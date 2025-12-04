import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth/auth-context'
// Removed CartProvider import, Zustand store does not need a provider
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundary from '@/components/error/error-boundary'
import { CartInitializer } from '@/components/common/cart-initializer'
import Header from '@/components/layout/header'
import SubHeader from '@/components/layout/sub-header'
import Footer from '@/components/layout/footer'
import ScrollToTopOnRouteChange from '@/components/common/scroll-to-top'
import BackToTop from '@/components/common/back-to-top'
import QueryProvider from '@/providers/query-provider'
import { Suspense } from 'react'
import Loading from '@/components/common/loading'
import { PageTransition } from '@/components/ui/page-transition'
import { StructuredData } from '@/components/seo/structured-data'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'VB Cart - Premium Fashion Store | Designer Clothing for Men, Women & Children',
    template: '%s | VB Cart - Premium Fashion Store'
  },
  description: 'Discover the latest fashion trends with VB Cart. Premium designer clothing, accessories, and lifestyle products for men, women, and children. Fast shipping, easy returns, and exceptional quality.',
  keywords: [
    'fashion', 'clothing', 'ecommerce', 'VB Cart', 'premium fashion',
    'designer clothes', 'men fashion', 'women fashion', 'children clothing',
    'online shopping', 'fashion store', 'trendy clothes', 'quality apparel',
    'fashion accessories', 'lifestyle products', 'brand clothing'
  ],
  authors: [{ name: 'VB Cart Team', url: 'https://vbcart.com' }],
  creator: 'VB Cart',
  publisher: 'VB Cart',
  manifest: '/manifest.json',
  metadataBase: new URL('https://vbcart.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vbcart.com',
    title: 'VB Cart - Premium Fashion Store',
    description: 'Discover the latest fashion trends with VB Cart. Premium designer clothing for men, women, and children.',
    siteName: 'VB Cart',
    images: [
      {
        url: '/logos/vb_logo.png',
        width: 1200,
        height: 630,
        alt: 'VB Cart Logo - Premium Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VB Cart - Premium Fashion Store',
    description: 'Discover the latest fashion trends with VB Cart. Premium designer clothing for men, women, and children.',
    images: ['/logos/vb_logo.png'],
    creator: '@vbcart', // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-144x144.png',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'VB Cart',
    'application-name': 'VB Cart',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'theme-color': '#3b82f6',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <CartInitializer />
                <div className="min-h-screen flex flex-col">
                  <ScrollToTopOnRouteChange />
                  <Header />
                  <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse"></div>}>
                    <SubHeader />
                  </Suspense>
                  <main className="flex-1">
                    <Suspense fallback={<Loading />}>
                      {children}
                    </Suspense>
                  </main>
                  <Footer />
                </div>
                <BackToTop />
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}