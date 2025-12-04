import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Simple Icon */}
      <div className="absolute top-32 right-20 text-blue-400/60">
        <ShoppingBag size={48} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center justify-center">
        <div className="text-center w-full">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-center">
            <span className="block">Welcome to</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Aprylo
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed text-center">
            Discover premium fashion for the whole family. From trendy men's wear to elegant 
            women's fashion and adorable children's clothing.
            <span className="inline-block ml-2">✨</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl rounded-full group hover:scale-105 transition-all duration-300">
              <Link href="/products" className="flex items-center gap-2">
                Shop Now 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="px-8 py-4 text-lg font-medium border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-full transition-all duration-300"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-slate-600 dark:text-slate-400">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
              <div className="text-slate-600 dark:text-slate-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-slate-600 dark:text-slate-400">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
