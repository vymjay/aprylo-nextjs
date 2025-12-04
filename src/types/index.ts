// User types
export interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
  addresses?: Address[]
}

export interface Address {
  id: number
  userId?: number
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

// Product types
export interface Product {
  id: number
  title: string
  slug: string
  description: string
  price: number
  originalPrice: number
  images: string[]
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: Date
  variants?: ProductVariant[]
  reviews?: Review[]
  category?: {
    id: number
    name: string
  }
}

export interface ProductVariant {
  id: number
  title: string
  productId: number
  size: string
  color: string
  stock: number
  sku: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
}

// Cart types
export interface CartItem {
  id: number               // unique cart item id (e.g. timestamp)
  
  productId: number        // product's unique id
  variantId: number        // variant's unique id
  quantity: number         // how many units in cart
  price: number            // unit price used for this cart item (usually product.price)
  product: Product         // full product data
  variant: ProductVariant  // full variant data
}

// Order types
export interface Order {
  id: number
  userId: number
  status: OrderStatus
  totalAmount: number
  subtotal: number
  tax: number
  shipping: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  razorpayOrderId?: string
  razorpayPaymentId?: string
  trackingNumber: string
  shippingAddressId: number
  createdAt: Date
  updatedAt: Date
  deliveredAt?: Date
  user?: User
  shippingAddress?: Address
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  variantId: number
  quantity: number
  price: number
  product: Product
  variant: ProductVariant
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

// Review types
export interface Review {
  id: number
  productId: number
  userId: number
  rating: number
  title: string
  comment: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
  user?: User
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter types
export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CheckoutFormData {
  shippingAddress: Address
  paymentMethod: string
  notes?: string
}

// Razorpay types
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

// Component props types
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

// Error types
export interface AppError {
  message: string
  statusCode?: number
  code?: string
}

// State types
export interface CartState {
  items: CartItem[]
  total: number
  isLoading: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Utility types
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Event handler types
export type ChangeHandler<T = string> = (value: T) => void
export type SubmitHandler = (event: React.FormEvent) => void
export type ClickHandler = (event: React.MouseEvent) => void