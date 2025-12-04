"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { VariantSelector } from "./variant-selector";
import { getInternalUserId } from "@/lib/repositories/user-repository";
import type { Product as BaseProduct, ProductVariant } from "@/types";

const calculateDiscountPercentage = (original: number, current: number) => {
  const normalizedOriginal = original > 1000 ? original / 100 : original;
  const normalizedCurrent = current > 1000 ? current / 100 : current;
  return Math.round(((normalizedOriginal - normalizedCurrent) / normalizedOriginal) * 100);
};

interface Product extends BaseProduct {
  variants?: ProductVariant[];
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const syncCart = useCartStore((state) => state.syncCart);
  const { user } = useAuth();
  const [customUserId, setCustomUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [loadingVariants, setLoadingVariants] = useState(true);

  // Fetch variants
  useEffect(() => {
    async function fetchVariants() {
      try {
        setLoadingVariants(true);
        const response = await fetch(`/api/products/${product.id}/variants`);
        if (!response.ok) throw new Error('Failed to fetch variants');
        
        const data = await response.json();
        setVariants(data);
        if (data.length > 0) {
          setSelectedVariant(data[0]);
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
        toast({
          title: "Error",
          description: "Failed to load product variants",
          variant: "destructive"
        });
      } finally {
        setLoadingVariants(false);
      }
    }
    fetchVariants();
  }, [product.id, toast]);

  useEffect(() => {
    async function fetchCustomUserId() {
      if (user?.id) {
        try {
          const internalId = await getInternalUserId();
          setCustomUserId(internalId);
        } catch (err) {
          console.error('Error in fetchCustomUserId:', err);
          setCustomUserId(null);
        }
      } else {
        setCustomUserId(null);
      }
    }
    fetchCustomUserId();
  }, [user]);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      if (!customUserId) {
        toast({
          title: "Login Required",
          description: "Please login to add items to your cart.",
        });
        return;
      }

      if (!selectedVariant) {
        toast({
          title: "Error",
          description: "Please select a variant.",
          variant: "destructive"
        });
        return;
      }

      if (selectedVariant.stock < 1) {
        toast({
          title: "Out of Stock",
          description: `${product.title} is currently out of stock.`,
        });
        return;
      }

      if (quantity > selectedVariant.stock) {
        toast({
          title: "Limited Stock",
          description: `Only ${selectedVariant.stock} items available.`,
          variant: "destructive"
        });
        setQuantity(selectedVariant.stock);
        return;
      }

      await addItem({
        price: product.price,
        productId: product.id,
        quantity,
        variantId: selectedVariant.id,
        userId: customUserId,
      });

      // Sync cart to get updated data
      await syncCart(customUserId);

      toast({
        title: "Added to Cart",
        description: `${product.title} × ${quantity} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Image Slider */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="rounded-xl overflow-hidden"
        >
          {product.images?.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                alt={product.title}
                className="w-full h-[400px] object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-6">
        {/* Title & Price */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xl font-semibold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <Badge className="bg-red-500 text-white">
              {calculateDiscountPercentage(
                product.originalPrice,
                product.price
              )}
              % OFF
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">{product.description}</p>

        {/* Variant Selector */}
        <div className="flex flex-col gap-4">
          <span className="font-medium">Select Variant:</span>
          {loadingVariants ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-md" />
          ) : (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={(variant) => setSelectedVariant(variant)}
              disabled={loading}
            />
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
              disabled={!selectedVariant}
            >
              -
            </button>
            <span className="px-4">{quantity}</span>
            <button
              onClick={() => setQuantity(
                Math.min((selectedVariant?.stock || 1), quantity + 1)
              )}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
              disabled={!selectedVariant || quantity >= (selectedVariant?.stock || 0)}
            >
              +
            </button>
          </div>
          {selectedVariant && (
            <span className="text-sm text-gray-500">
              ({selectedVariant.stock} available)
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <Button
            className="flex items-center gap-2 px-6 py-3 text-lg"
            onClick={handleAddToCart}
            disabled={loading || !selectedVariant?.id || (selectedVariant?.stock ?? 0) < 1 || !customUserId}
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? (
              "Adding..."
            ) : !(selectedVariant?.stock ?? 0) ? (
              "Out of Stock"
            ) : !customUserId ? (
              "Login to Add"
            ) : !selectedVariant ? (
              "Select Variant"
            ) : (
              "Add to Cart"
            )}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 text-lg"
          >
            <Heart className="w-5 h-5" /> Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
