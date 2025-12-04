import { useState } from "react";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name?: string;
  };
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
};

// Include all statuses in steps for completeness
export const steps: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
];

// Example initial orders data (static, for testing)
const initialOrders: Order[] = [
  {
    id: "ORD123456",
    userId: "USER123",
    status: "SHIPPED",
    subtotal: 2000,
    tax: 180,
    shipping: 50,
    total: 2230,
    currency: "INR",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-05T12:00:00Z",
    items: [
      {
        id: "ITEM1",
        orderId: "ORD123456",
        productId: "PROD1",
        variantId: "VAR1",
        quantity: 1,
        unitPrice: 1500,
        createdAt: "2025-08-01T10:00:00Z",
        updatedAt: "2025-08-01T10:00:00Z",
        product: { id: "PROD1", name: "Wireless Headphones" },
        variant: { id: "VAR1", name: "Black" },
      },
      {
        id: "ITEM2",
        orderId: "ORD123456",
        productId: "PROD2",
        variantId: "VAR2",
        quantity: 2,
        unitPrice: 250,
        createdAt: "2025-08-01T10:00:00Z",
        updatedAt: "2025-08-01T10:00:00Z",
        product: { id: "PROD2", name: "USB-C Charger" },
        variant: { id: "VAR2", name: "White" },
      },
    ],
  },
  {
    id: "ORD123457",
    userId: "USER456",
    status: "CANCELLED",
    subtotal: 1500,
    tax: 135,
    shipping: 40,
    total: 1675,
    currency: "INR",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    createdAt: "2025-07-30T08:15:00Z",
    updatedAt: "2025-08-02T09:30:00Z",
    items: [
      {
        id: "ITEM3",
        orderId: "ORD123457",
        productId: "PROD4",
        variantId: "VAR4",
        quantity: 1,
        unitPrice: 1500,
        createdAt: "2025-07-30T08:15:00Z",
        updatedAt: "2025-07-30T08:15:00Z",
        product: { id: "PROD4", name: "Bluetooth Speaker" },
        variant: { id: "VAR4", name: "Red" },
      },
    ],
  },
  {
    id: "ORD123458",
    userId: "USER789",
    status: "FAILED",
    subtotal: 3000,
    tax: 270,
    shipping: 60,
    total: 3330,
    currency: "INR",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    createdAt: "2025-07-25T11:00:00Z",
    updatedAt: "2025-07-26T10:00:00Z",
    items: [
      {
        id: "ITEM4",
        orderId: "ORD123458",
        productId: "PROD5",
        variantId: "VAR5",
        quantity: 1,
        unitPrice: 3000,
        createdAt: "2025-07-25T11:00:00Z",
        updatedAt: "2025-07-25T11:00:00Z",
        product: { id: "PROD5", name: "Gaming Keyboard" },
        variant: { id: "VAR5", name: "RGB" },
      },
    ],
  },
];

// Custom hook to manage orders store
export function useOrderStore() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((orders) =>
      orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  // Add a new order
  const addOrder = (newOrder: Order) => {
    setOrders((orders) => [...orders, newOrder]);
  };

  return {
    orders,
    updateOrderStatus,
    addOrder,
    steps,
  };
}