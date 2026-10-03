import { api } from './apiClient';
import { CartItem } from '../types/marketplace';

export const cartService = {
  async getCart(): Promise<{ cart: CartItem[] }> {
    return api.get<{ cart: CartItem[] }>('/cart');
  },

  async addToCart(
    shoeId: string,
    size: number,
    quantity = 1
  ): Promise<{ cart: CartItem[]; message: string }> {
    return api.post<{ cart: CartItem[]; message: string }>('/cart', { shoeId, size, quantity });
  },

  async updateQuantity(itemId: string, delta: number): Promise<{ cart: CartItem[] }> {
    return api.put<{ cart: CartItem[] }>(`/cart/${itemId}`, { delta });
  },

  async removeItem(itemId: string): Promise<{ cart: CartItem[]; message: string }> {
    return api.delete<{ cart: CartItem[]; message: string }>(`/cart/${itemId}`);
  },

  async clearCart(): Promise<{ cart: CartItem[]; message: string }> {
    return api.delete<{ cart: CartItem[]; message: string }>('/cart');
  },
};
