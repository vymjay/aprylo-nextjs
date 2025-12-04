"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";
import { getInternalUserId } from "@/lib/repositories/user-repository";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customUserId, setCustomUserId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total);
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    async function fetchCustomUserId() {
      if (user?.id && !initialized) {
        try {
          const internalId = await getInternalUserId();
          setCustomUserId(internalId);
          // Sync cart data for this component
          await syncCart(internalId);
          setInitialized(true);
        } catch (err) {
          console.error('Error in fetchCustomUserId:', err);
          toast({
            title: "Error",
            description: "Failed to initialize cart. Please refresh the page.",
            variant: "destructive",
          });
          setCustomUserId(null);
          setInitialized(true);
        }
      } else if (!user?.id) {
        setCustomUserId(null);
        setInitialized(false);
      }
    }
    fetchCustomUserId();
  }, [user?.id, initialized, syncCart, toast]);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-white p-4 rounded-lg shadow"
                >
                  {item.product?.images?.[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <h2 className="text-lg font-semibold">{item.product?.title}</h2>
                    {item.variant && (
                      <p className="text-sm text-gray-500">{item.variant.title}</p>
                    )}
                    <p className="text-gray-500">{formatPrice(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (typeof customUserId === 'number') {
                            try {
                              setIsLoading(true);
                              await updateItem(
                                item.id,
                                Math.max(1, item.quantity - 1),
                                customUserId
                              );
                            } catch (error) {
                              console.error('Error updating item:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update item quantity",
                                variant: "destructive",
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                        disabled={isLoading}
                      >
                        −
                      </Button>
                      <span className="px-3">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (typeof customUserId === 'number') {
                            try {
                              setIsLoading(true);
                              await updateItem(
                                item.id,
                                item.quantity + 1,
                                customUserId
                              );
                            } catch (error) {
                              console.error('Error updating item:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update item quantity",
                                variant: "destructive",
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                        disabled={isLoading}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (typeof customUserId === 'number') {
                          try {
                            setIsLoading(true);
                            await removeItem(item.id, customUserId);
                            toast({
                              title: "Item removed",
                              description: "Item has been removed from your cart",
                            });
                          } catch (error) {
                            console.error('Error removing item:', error);
                            toast({
                              title: "Error",
                              description: "Failed to remove item from cart",
                              variant: "destructive",
                            });
                          } finally {
                            setIsLoading(false);
                          }
                        } else {
                          toast({
                            title: "Error",
                            description: "Please log in to manage your cart",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="mt-2 text-red-500 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-4">
                <span>Total</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <Button className="w-full mb-2">Checkout</Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (typeof customUserId === 'number') {
                    try {
                      setIsLoading(true);
                      await clearCart(customUserId);
                      toast({
                        title: "Cart cleared",
                        description: "All items have been removed from your cart",
                      });
                    } catch (error) {
                      console.error('Error clearing cart:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear cart",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  } else {
                    toast({
                      title: "Error",
                      description: "Please log in to manage your cart",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={typeof customUserId !== 'number' || isLoading}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}