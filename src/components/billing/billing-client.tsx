'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
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

interface BillingClientProps {
    orders: any[]
    user: any
}

export default function BillingClient({ orders, user }: BillingClientProps) {
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

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
                throw new Error('Failed to download invoice')
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
                    <div className="p-6 text-center text-gray-500">
                        No invoices found matching your criteria.
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
