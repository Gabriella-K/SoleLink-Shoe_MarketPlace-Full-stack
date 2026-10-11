import { api } from './apiClient';
import { Shoe, FilterState } from '../types/marketplace';

export const productService = {
  async getShoes(filters?: Partial<FilterState>): Promise<{ total: number; shoes: Shoe[] }> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.searchQuery) params.append('search', filters.searchQuery);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
      if (filters.size && filters.size !== 'All') params.append('size', String(filters.size));
      if (filters.condition && filters.condition !== 'All') params.append('condition', filters.condition);
      if (filters.vendorId && filters.vendorId !== 'All') params.append('vendorId', filters.vendorId);
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ total: number; shoes: Shoe[] }>(`/shoes${query}`);
  },

  async getShoeById(id: string): Promise<{ shoe: Shoe; vendor: any }> {
    return api.get<{ shoe: Shoe; vendor: any }>(`/shoes/${id}`);
  },

  async createShoe(shoeData: Partial<Shoe>): Promise<{ shoe: Shoe; message: string }> {
    return api.post<{ shoe: Shoe; message: string }>('/shoes', shoeData);
  },

  async updateShoe(id: string, updates: Partial<Shoe>): Promise<{ shoe: Shoe; message: string }> {
    return api.put<{ shoe: Shoe; message: string }>(`/shoes/${id}`, updates);
  },

  async deleteShoe(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/shoes/${id}`);
  },

  async updateStock(
    shoeId: string,
    size: number,
    newStock: number
  ): Promise<{ shoe: Shoe; message: string }> {
    return api.patch<{ shoe: Shoe; message: string }>(`/shoes/${shoeId}/stock`, { size, newStock });
  },
};
