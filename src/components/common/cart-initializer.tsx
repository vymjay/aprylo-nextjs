"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { getInternalUserId } from "@/lib/repositories/user-repository";

export function CartInitializer() {
  const { user } = useAuth();
  const init = useCartStore((state) => state.init);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function initializeCart() {
      // Only initialize if user changed
      const currentUserId = user?.id || null;
      if (lastUserIdRef.current === currentUserId) {
        return; // No change, skip initialization
      }
      
      lastUserIdRef.current = currentUserId;

      if (user?.id) {
        try {
          const internalId = await getInternalUserId();
          await init(internalId);
        } catch (error) {
          console.error("Error initializing cart:", error);
          await init(null);
        }
      } else {
        await init(null);
      }
    }

    initializeCart();
  }, [user?.id, init]); // Only depend on user.id

  return null; // This component doesn't render anything
}
