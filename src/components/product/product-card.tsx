"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { VariantSelector } from "./variant-selector";
import type { ProductVariant } from "@/types";
import { useInternalUserId } from "@/hooks/api/use-users";
import { useProductVariants } from "@/hooks/api/use-products";

export interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();

  // Use hooks for data fetching
  const { data: internalUserData } = useInternalUserId()
  const { data: variants = [], isLoading: loadingVariants } = useProductVariants(product.id)

  // Set default variant when variants load
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  const discountPercentage = product.originalPrice > product.price 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

    const handleAddToCart = async () => {
    const userId = internalUserData?.id;
    
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVariant) {
      toast({
        title: "Variant required",
        description: "Please select a variant first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1,
        price: product.price,
        userId: userId,
      });

      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 border-0 animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <div className="relative w-full h-full">
            <Image
              src={product.images?.[0] || "/placeholder-product.jpg"}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={index < 4}
              unoptimized={process.env.NODE_ENV === 'development'}
            />
          </div>
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 animate-scale-in">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg animate-pulse-subtle">
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}

        {/* Hover Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart 
              size={16} 
              className={isFavorited ? 'fill-current' : ''} 
            />
          </button>
          <Link href={`/products/${product.id}`}>
            <div className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 hover:scale-110">
              <Eye size={16} />
            </div>
          </Link>
        </div>

        {/* Stock Badge */}
        {selectedVariant && selectedVariant.stock < 1 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
            <Badge variant="destructive" className="text-lg font-bold">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold mb-3 line-clamp-2 transition-colors duration-300 text-lg">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="animate-scale-in hover:scale-125 transition-transform duration-200"
                style={{ animationDelay: `${index * 0.1 + 0.1 + i * 0.05}s` }}
              >
                <Star
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-4 animate-slide-left" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Variant Selector */}
        <div className="mb-4 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.4}s` }}>
          {loadingVariants ? (
            <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 animate-shimmer rounded-md" />
          ) : (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={(variant) => setSelectedVariant(variant)}
              disabled={loading || !internalUserData?.id}
            />
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="animate-scale-in" style={{ animationDelay: `${index * 0.1 + 0.5}s` }}>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            disabled={loading || !selectedVariant?.id || (selectedVariant?.stock ?? 0) < 1 || !internalUserData?.id}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </div>
            ) : !(selectedVariant?.stock ?? 0) ? (
              'Out of Stock'
            ) : !internalUserData?.id ? (
              'Login to Add'
            ) : !selectedVariant ? (
              'Select Variant'
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 group-hover:animate-wiggle" />
                Add to Cart
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
