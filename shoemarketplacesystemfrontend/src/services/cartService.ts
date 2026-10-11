import { api } from './apiClient';
import { CartItem } from '../types/marketplace';
import { toCartItems } from './adapters';

// The API returns the whole cart object; the UI only wants the list of items.
export const cartService = {
  async getCart(): Promise<{ cart: CartItem[] }> {
    return { cart: toCartItems(await api.get<any>('/cart')) };
  },

  async addToCart(
    shoeId: string,
    size: number,
    quantity = 1
  ): Promise<{ cart: CartItem[]; message: string }> {
    const raw = await api.post<any>('/cart', { shoeId, size, quantity });
    return { cart: toCartItems(raw), message: 'Added shoe to shopping bag' };
  },

  async updateQuantity(itemId: string, delta: number): Promise<{ cart: CartItem[] }> {
    return { cart: toCartItems(await api.put<any>(`/cart/${itemId}`, { delta })) };
  },

  async removeItem(itemId: string): Promise<{ cart: CartItem[]; message: string }> {
    const raw = await api.delete<any>(`/cart/${itemId}`);
    return { cart: toCartItems(raw), message: 'Item removed from cart' };
  },

  async clearCart(): Promise<{ cart: CartItem[]; message: string }> {
    const raw = await api.delete<any>('/cart');
    return { cart: toCartItems(raw), message: 'Cart cleared' };
  },
};
