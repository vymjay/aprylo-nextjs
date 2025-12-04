export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      Address: {
        Row: {
          city: string
          country: string
          id: number
          isDefault: boolean
          name: string
          phone: string
          state: string
          street: string
          userId: number | null
          zipCode: string
        }
        Insert: {
          city: string
          country: string
          id?: number
          isDefault: boolean
          name: string
          phone: string
          state: string
          street: string
          userId?: number | null
          zipCode: string
        }
        Update: {
          city?: string
          country?: string
          id?: number
          isDefault?: boolean
          name?: string
          phone?: string
          state?: string
          street?: string
          userId?: number | null
          zipCode?: string
        }
        Relationships: [
          {
            foreignKeyName: "Address_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CartItem: {
        Row: {
          id: number
          price: number
          productId: number
          quantity: number
          userId: number | null
          variantId: number
        }
        Insert: {
          id?: number
          price: number
          productId: number
          quantity: number
          userId?: number | null
          variantId: number
        }
        Update: {
          id?: number
          price?: number
          productId?: number
          quantity?: number
          userId?: number | null
          variantId?: number
        }
        Relationships: [
          {
            foreignKeyName: "CartItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CartItem_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CartItem_variantId_fkey"
            columns: ["variantId"]
            isOneToOne: false
            referencedRelation: "ProductVariant"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          description: string
          id: number
          image: string
          name: string
          slug: string
        }
        Insert: {
          description: string
          id?: number
          image: string
          name: string
          slug: string
        }
        Update: {
          description?: string
          id?: number
          image?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      Order: {
        Row: {
          billing_address: Json | null
          company_details: Json | null
          createdAt: string
          deliveredAt: string | null
          due_date: string | null
          id: number
          invoice_date: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          invoice_status: string | null
          notes: string | null
          paymentMethod: string
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"]
          razorpayOrderId: string | null
          razorpayPaymentId: string | null
          shipping: number
          shippingAddressId: number
          status: Database["public"]["Enums"]["OrderStatus"]
          subtotal: number
          tax: number
          tax_details: Json | null
          totalAmount: number
          trackingNumber: string
          updatedAt: string
          userId: number
        }
        Insert: {
          billing_address?: Json | null
          company_details?: Json | null
          createdAt?: string
          deliveredAt?: string | null
          due_date?: string | null
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_status?: string | null
          notes?: string | null
          paymentMethod: string
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"]
          razorpayOrderId?: string | null
          razorpayPaymentId?: string | null
          shipping: number
          shippingAddressId: number
          status: Database["public"]["Enums"]["OrderStatus"]
          subtotal: number
          tax: number
          tax_details?: Json | null
          totalAmount: number
          trackingNumber: string
          updatedAt: string
          userId: number
        }
        Update: {
          billing_address?: Json | null
          company_details?: Json | null
          createdAt?: string
          deliveredAt?: string | null
          due_date?: string | null
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_status?: string | null
          notes?: string | null
          paymentMethod?: string
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"]
          razorpayOrderId?: string | null
          razorpayPaymentId?: string | null
          shipping?: number
          shippingAddressId?: number
          status?: Database["public"]["Enums"]["OrderStatus"]
          subtotal?: number
          tax?: number
          tax_details?: Json | null
          totalAmount?: number
          trackingNumber?: string
          updatedAt?: string
          userId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Order_shippingAddressId_fkey"
            columns: ["shippingAddressId"]
            isOneToOne: false
            referencedRelation: "Address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Order_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderItem: {
        Row: {
          id: number
          orderId: number
          price: number
          productId: number
          quantity: number
          variantId: number
        }
        Insert: {
          id?: number
          orderId: number
          price: number
          productId: number
          quantity: number
          variantId: number
        }
        Update: {
          id?: number
          orderId?: number
          price?: number
          productId?: number
          quantity?: number
          variantId?: number
        }
        Relationships: [
          {
            foreignKeyName: "OrderItem_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderItem_variantId_fkey"
            columns: ["variantId"]
            isOneToOne: false
            referencedRelation: "ProductVariant"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          categoryId: number | null
          createdAt: string
          description: string
          id: number
          images: string[] | null
          isActive: boolean
          originalPrice: number
          price: number
          rating: number
          reviewCount: number
          slug: string
          title: string
        }
        Insert: {
          categoryId?: number | null
          createdAt?: string
          description: string
          id?: number
          images?: string[] | null
          isActive: boolean
          originalPrice: number
          price: number
          rating: number
          reviewCount: number
          slug: string
          title: string
        }
        Update: {
          categoryId?: number | null
          createdAt?: string
          description?: string
          id?: number
          images?: string[] | null
          isActive?: boolean
          originalPrice?: number
          price?: number
          rating?: number
          reviewCount?: number
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "Product_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductVariant: {
        Row: {
          color: string
          id: number
          productId: number
          size: string
          sku: string
          stock: number
          title: string
        }
        Insert: {
          color: string
          id?: number
          productId: number
          size: string
          sku: string
          stock: number
          title: string
        }
        Update: {
          color?: string
          id?: number
          productId?: number
          size?: string
          sku?: string
          stock?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProductVariant_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Review: {
        Row: {
          comment: string
          createdAt: string | null
          id: number
          productId: number
          rating: number
          title: string | null
          userId: number
        }
        Insert: {
          comment: string
          createdAt?: string | null
          id?: number
          productId: number
          rating: number
          title?: string | null
          userId: number
        }
        Update: {
          comment?: string
          createdAt?: string | null
          id?: number
          productId?: number
          rating?: number
          title?: string | null
          userId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Review_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Review_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ReviewUpvote: {
        Row: {
          createdat: string | null
          id: number
          reviewid: number
          userid: number
        }
        Insert: {
          createdat?: string | null
          id?: never
          reviewid: number
          userid: number
        }
        Update: {
          createdat?: string | null
          id?: never
          reviewid?: number
          userid?: number
        }
        Relationships: [
          {
            foreignKeyName: "ReviewUpvote_reviewid_fkey"
            columns: ["reviewid"]
            isOneToOne: false
            referencedRelation: "Review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ReviewUpvote_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: number
          name: string
          role: string
          supabaseUserId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: number
          name: string
          role: string
          supabaseUserId?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: number
          name?: string
          role?: string
          supabaseUserId?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_update_addresses: {
        Args: {
          p_addresses: Json[]
          p_deleted_ids: number[]
          p_user_id: number
        }
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_by_supabase_id: {
        Args: { supabase_id: string }
        Returns: {
          createdAt: string
          email: string
          id: number
          name: string
          role: string
          supabaseUserId: string | null
          updatedAt: string
        }[]
      }
      is_address_owner: {
        Args: { address_user_id: number }
        Returns: boolean
      }
    }
    Enums: {
      OrderStatus:
        | "PENDING"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
      PaymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
      UserRole: "ADMIN" | "USER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      OrderStatus: [
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      PaymentStatus: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      UserRole: ["ADMIN", "USER"],
    },
  },
} as const
