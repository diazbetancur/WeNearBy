/**
 * CartContext - Shopping Cart State Management
 *
 * Manages cart items, quantities, and delivery mode
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { DeliveryMode, OrderItem, Product } from '../types/models';

interface CartItem extends OrderItem {
  product: Product; // Keep product reference for display
}

interface CartContextValue {
  items: CartItem[];
  deliveryMode: DeliveryMode;
  itemCount: number;
  total: number;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');

  /**
   * Add product to cart or increment quantity if already exists
   */
  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);

      if (existingIndex >= 0) {
        // Increment existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
            product
          }
        ];
      }
    });
  }, []);

  /**
   * Remove product from cart
   */
  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  /**
   * Update quantity of a cart item
   */
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  /**
   * Clear all cart items
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Total number of items in cart
   */
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  /**
   * Total price of cart
   */
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      deliveryMode,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      setDeliveryMode,
      clearCart
    }),
    [items, deliveryMode, itemCount, total, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
