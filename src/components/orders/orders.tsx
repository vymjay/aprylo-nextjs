"use client";

import React, { useState } from "react";
import Stepper from "./stepper";
import { useOrderStore } from "@/stores/order-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Eye, 
  FileText, 
  DollarSign 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function Orders() {
  const { orders } = useOrderStore();
  const { toast } = useToast();
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  // Helper to format ISO date to readable string
  const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString();

  // Map status to text color classes
  const statusColorClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600";
      case "SHIPPED":
        return "text-blue-600";
      case "PROCESSING":
        return "text-yellow-600";
      case "PENDING":
        return "text-yellow-400";
      case "CANCELLED":
      case "FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const response = await fetch(`/api/invoices/${orderId}/download`);
      
      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'Failed to download invoice';
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error || errorMessage;
        } catch {
          // If not JSON, use the text as error message
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
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
      setDownloadingInvoice(null);
    }
  };

  // Handle invoice view
  const handleViewInvoice = async (orderId: string) => {
    try {
      // First check if the invoice endpoint is accessible
      const testResponse = await fetch(`/api/invoices/${orderId}/view`, {
        method: 'HEAD' // Just check if the resource exists
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
  };

  // Check if order has invoice available (processed orders)
  const hasInvoice = (status: string) => {
    return ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status);
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      SHIPPED: { color: 'bg-blue-100 text-blue-800', label: 'Paid' },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      PENDING: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    }[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-md p-4 mb-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row justify-between mb-3">
              <div>
                <p className="font-semibold">Order ID: {order.id}</p>
                <p className="text-gray-600 text-sm">
                  Order Date: {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-sm text-gray-700">
                Tracking Number:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {order.razorpayOrderId ?? "N/A"}
                </span>
              </div>
            </div>

            <Stepper currentStep={order.status} />

            <div className="mt-4">
              <p className="font-semibold mb-2">Items:</p>
              <ul className="list-disc list-inside text-gray-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product?.name ?? "Unknown product"} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 font-semibold">
              Current Status:{" "}
              <span className={statusColorClass(order.status)}>{order.status}</span>
            </p>

            {/* Billing Section */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200 mt-4 rounded-b-md">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Payment:</span>
                  {getPaymentStatusBadge(order.status)}
                </div>
                <div className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
              
              {hasInvoice(order.status) && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoice(order.id)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Invoice</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order.id)}
                    disabled={downloadingInvoice === order.id}
                    className="flex items-center space-x-1"
                  >
                    {downloadingInvoice === order.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {!hasInvoice(order.status) && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>Invoice available after processing</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}