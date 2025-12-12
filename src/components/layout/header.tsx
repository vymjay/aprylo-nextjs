'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { useCartStore } from "@/stores/cart-store"
import { usePathname } from "next/navigation"
import AccountDropdown from '@/components/account/account-dropdown'
import GlobalSearch from '@/components/layout/global-search'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const cartItemCount = useCartStore((state) => state.cartCount)
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close mobile menu on Escape
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Enhanced mobile menu handler with better accessibility
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu and focus management
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b sticky top-0 z-40 transition-all duration-300" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center flex-shrink-0">
            <div className="md:hidden mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                className="p-2 hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>

            <Link 
              href="/home" 
              className="flex items-center flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="Aprylo - Go to homepage"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
                Aprylo
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center" role="navigation" aria-label="Main navigation">
            {/* Global Search - Hidden for now */}
            <div className="hidden">
              <GlobalSearch className="w-64" />
            </div>
            
            <Link
              href="/home"
              className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                pathname === "/home" ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
              aria-current={pathname === "/home" ? "page" : undefined}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                pathname === "/products" ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
              aria-current={pathname === "/products" ? "page" : undefined}
            >
              Products
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                pathname === "/about" ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                pathname === "/contact" ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              Contact
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Desktop Cart */}
            <Link 
              href="/cart" 
              className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label={`Shopping cart ${cartItemCount > 0 ? `with ${cartItemCount} items` : '(empty)'}`}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-blue-50 hover:scale-110 transition-all duration-300 relative"
              >
                <ShoppingCart size={20} aria-hidden="true" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 animate-pulse"
                    aria-label={`${cartItemCount} items in cart`}
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <AccountDropdown />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            id="mobile-navigation"
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg animate-fade-in-down"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Mobile Navigation Links */}
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search - Hidden for now */}
              <div className="hidden px-3 pb-3">
                <GlobalSearch className="w-full" compact />
              </div>
              
              <Link
                href="/home"
                className={`block px-3 py-3 text-base font-medium transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  pathname === "/home" ? "text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600" : "text-gray-700"
                }`}
                onClick={handleMobileLinkClick}
                aria-current={pathname === "/home" ? "page" : undefined}
              >
                <div className="flex items-center">
                  <span>Home</span>
                  {pathname === "/home" && (
                    <Badge className="ml-auto text-xs">Current</Badge>
                  )}
                </div>
              </Link>
              <Link
                href="/products"
                className={`block px-3 py-3 text-base font-medium transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  pathname === "/products" ? "text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600" : "text-gray-700"
                }`}
                onClick={handleMobileLinkClick}
                aria-current={pathname === "/products" ? "page" : undefined}
              >
                <div className="flex items-center">
                  <span>Products</span>
                  {pathname === "/products" && (
                    <Badge className="ml-auto text-xs">Current</Badge>
                  )}
                </div>
              </Link>
              <Link
                href="/about"
                className={`block px-3 py-3 text-base font-medium transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  pathname === "/about" ? "text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600" : "text-gray-700"
                }`}
                onClick={handleMobileLinkClick}
                aria-current={pathname === "/about" ? "page" : undefined}
              >
                <div className="flex items-center">
                  <span>About</span>
                  {pathname === "/about" && (
                    <Badge className="ml-auto text-xs">Current</Badge>
                  )}
                </div>
              </Link>
              <Link
                href="/contact"
                className={`block px-3 py-3 text-base font-medium transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  pathname === "/contact" ? "text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600" : "text-gray-700"
                }`}
                onClick={handleMobileLinkClick}
                aria-current={pathname === "/contact" ? "page" : undefined}
              >
                <div className="flex items-center">
                  <span>Contact</span>
                  {pathname === "/contact" && (
                    <Badge className="ml-auto text-xs">Current</Badge>
                  )}
                </div>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={handleMobileLinkClick}
                  aria-label={`Shopping cart ${cartItemCount > 0 ? `with ${cartItemCount} items` : '(empty)'}`}
                >
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center text-xs p-0"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </span>
                </Link>

                {!user && (
                  <div className="flex items-center space-x-2">
                    <Link href="/login" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleMobileLinkClick}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                      <Button 
                        size="sm"
                        onClick={handleMobileLinkClick}
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
