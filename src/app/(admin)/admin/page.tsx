'use client'

import Link from 'next/link'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

export default function AdminDashboard() {
  const { user } = useAuth()

  const dashboardCards = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
      stats: {
        total: '150',
        change: '+12 this month'
      }
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-green-500',
      stats: {
        total: '89',
        change: '+5 today'
      }
    },
    {
      title: 'Customers',
      description: 'Manage customer accounts',
      icon: Users,
      href: '/admin/customers',
      color: 'bg-purple-500',
      stats: {
        total: '1,234',
        change: '+23 this week'
      }
    },
    {
      title: 'Analytics',
      description: 'View sales and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-orange-500',
      stats: {
        total: '$12,450',
        change: '+8.2% vs last month'
      }
    }
  ]

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: Plus,
      href: '/admin/products/new',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'View Store',
      description: 'See how your store looks to customers',
      icon: Eye,
      href: '/',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.user_metadata?.name || user?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Eye className="w-4 h-4 mr-2" />
              View Store
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={card.href}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{card.stats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">{card.stats.change}</p>
                  <CardDescription className="mt-2">{card.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Link href={action.href} className="block group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { text: 'New order #1234 received', time: '2 minutes ago', type: 'order' },
              { text: 'Product "Blue Shirt" updated', time: '1 hour ago', type: 'product' },
              { text: 'New customer registered', time: '3 hours ago', type: 'customer' },
              { text: 'Product "Red Shoes" added', time: '5 hours ago', type: 'product' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="text-sm text-gray-900">{activity.text}</span>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
