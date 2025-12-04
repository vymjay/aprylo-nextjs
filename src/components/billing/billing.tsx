'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    Download, 
    Eye, 
    Calendar, 
    DollarSign, 
    FileText, 
    CreditCard,
    Filter,
    Search
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client-browser'
import { useToast } from '@/hooks/use-toast'

interface Order {
    id: string
    invoiceNumber?: string
    createdAt: string
    status: string
    paymentStatus: string
    subtotal: number
    tax: number
    shipping: number
    totalAmount: number
    OrderItem: Array<{
        id: string
        quantity: number
        price: number
        Product: {
            id: string
            title: string
            images?: string[]
        }
    }>
    Address?: {
        name: string
        street: string
        city: string
        state: string
        zipCode: string
        country: string
        phone: string
    }
}

export default function Billing() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            fetchOrders()
        }
    }, [user])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const supabase = createClient()

            // First try a simple query to see if we have any orders at all
            const { data: simpleOrders, error: simpleError } = await supabase
                .from('Order')
                .select('id, status, createdAt, totalAmount, paymentStatus')
                .eq('userId', user?.id)

            if (simpleError) {
                throw new Error(`Database error: ${simpleError.message}`)
            }

            if (!simpleOrders || simpleOrders.length === 0) {
                setOrders([])
                return
            }

            // If we have orders, try the full query
            const { data, error } = await supabase
                .from('Order')
                .select(`
                    *,
                    OrderItem (
                        id,
                        quantity,
                        price,
                        Product (
                            id,
                            title,
                            images
                        )
                    )
                `)
                .eq('userId', user?.id)
                .order('createdAt', { ascending: false })

            if (error) {
                // Fall back to simple orders if the complex query fails
                const fallbackOrders = simpleOrders.map(order => ({
                    ...order,
                    invoiceNumber: undefined,
                    subtotal: order.totalAmount || 0,
                    tax: 0,
                    shipping: 0,
                    OrderItem: [],
                    Address: undefined
                }))
                setOrders(fallbackOrders as Order[])
                return
            }

            setOrders(data || [])
        } catch (err) {
            setError(`Failed to load billing information: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    // Filter orders based on search and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm) || 
                             order.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    // Calculate summary statistics
    const totalInvoices = orders.length
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const paidInvoices = orders.filter(order => order.paymentStatus === 'PAID').length
    const pendingInvoices = orders.filter(order => order.paymentStatus === 'PENDING').length

    const handleDownloadInvoice = async (orderId: string) => {
        setDownloadingInvoice(orderId)
        try {
            const response = await fetch(`/api/invoices/${orderId}/download`)
            
            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = 'Failed to download invoice';
                
                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.error || errorMessage;
                } catch {
                    errorMessage = errorData || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = `invoice-${orderId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            // Show success toast
            toast({
                title: "✅ Invoice Downloaded",
                description: `Invoice for order ${orderId} has been downloaded successfully.`,
                variant: "default",
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            
            toast({
                title: "❌ Download Failed",
                description: `Failed to download invoice: ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setDownloadingInvoice(null)
        }
    }

    const handleViewInvoice = async (orderId: string) => {
        try {
            // First check if the invoice endpoint is accessible
            const testResponse = await fetch(`/api/invoices/${orderId}/view`, {
                method: 'HEAD'
            });
            
            if (!testResponse.ok) {
                let errorMessage = 'Invoice not available';
                
                if (testResponse.status === 401) {
                    errorMessage = 'Please log in to view your invoice';
                } else if (testResponse.status === 404) {
                    errorMessage = 'Invoice not found for this order';
                } else if (testResponse.status === 500) {
                    errorMessage = 'Server error. Please try again later';
                }
                
                toast({
                    title: "❌ Cannot View Invoice",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }
            
            // If successful, open in new tab
            window.open(`/api/invoices/${orderId}/view`, '_blank');
        } catch (error) {
            toast({
                title: "❌ Network Error",
                description: "Unable to connect to the server. Please check your internet connection.",
                variant: "destructive",
            });
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
            PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
            REFUNDED: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
        }[status] || { color: 'bg-gray-100 text-gray-800', label: status }

        return (
            <Badge className={statusConfig.color}>
                {statusConfig.label}
            </Badge>
        )
    }

    const getOrderStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
            SHIPPED: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
            DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
            CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
        }[status] || { color: 'bg-gray-100 text-gray-800', label: status }

        return (
            <Badge className={statusConfig.color}>
                {statusConfig.label}
            </Badge>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p>Please log in to view your billing information.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <p>Loading billing information...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchOrders} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalAmount * 100)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                        <CreditCard className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingInvoices}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Invoice Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        {orders.length === 0 ? (
                            <div>
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                                <p className="text-gray-500 mb-4">
                                    You haven't placed any orders yet. Once you make a purchase, your invoices will appear here.
                                </p>
                                <Button onClick={() => window.location.href = '/home'}>
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Invoices</h3>
                                <p className="text-gray-500">
                                    No invoices found matching your search criteria. Try adjusting your filters.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    Order #{order.id}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.invoiceNumber ? `Invoice: ${order.invoiceNumber}` : 'Invoice pending'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getOrderStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.paymentStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatPrice(order.totalAmount * 100)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewInvoice(order.id)}
                                                    disabled={!order.invoiceNumber}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    disabled={downloadingInvoice === order.id || !order.invoiceNumber}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    {downloadingInvoice === order.id ? 'Downloading...' : 'Download'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
