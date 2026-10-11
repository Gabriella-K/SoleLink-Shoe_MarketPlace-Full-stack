import { api } from './apiClient';
import { Shoe, FilterState } from '../types/marketplace';
import { conditionToApi, fromShoe, toShoe, toVendor } from './adapters';

// The API wants a category *id* when saving a shoe, the UI only knows the *name*.
let categoryCache: { id: string; name: string }[] | null = null;

async function getCategoryId(name: string): Promise<string> {
  const find = () => categoryCache?.find((c) => c.name.toLowerCase() === name.toLowerCase());

  if (!categoryCache || !find()) {
    categoryCache = await api.get<{ id: string; name: string }[]>('/categories');
  }
  const match = find();
  if (!match) {
    throw new Error(`Category "${name}" does not exist on the server.`);
  }
  return match.id;
}

export const productService = {
  async getShoes(filters?: Partial<FilterState>): Promise<{ total: number; shoes: Shoe[] }> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.searchQuery) params.append('search', filters.searchQuery);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
      if (filters.size && filters.size !== 'All') params.append('size', String(filters.size));
      if (filters.condition && filters.condition !== 'All')
        params.append('condition', conditionToApi(filters.condition));
      if (filters.vendorId && filters.vendorId !== 'All') params.append('vendorId', filters.vendorId);
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const list = await api.get<any[]>(`/shoes${query}`);
    const shoes = list.map(toShoe);
    return { total: shoes.length, shoes };
  },

  async getShoeById(id: string): Promise<{ shoe: Shoe; vendor: any }> {
    const raw = await api.get<any>(`/shoes/${id}`);
    return { shoe: toShoe(raw), vendor: raw.vendor ? toVendor(raw.vendor) : undefined };
  },

  async createShoe(shoeData: Partial<Shoe>): Promise<{ shoe: Shoe; message: string }> {
    if (!shoeData.name || !shoeData.brand || !shoeData.category || !shoeData.price) {
      throw new Error('Please provide shoe name, brand, category, and price.');
    }
    const categoryId = await getCategoryId(shoeData.category);
    const raw = await api.post<any>('/shoes', fromShoe(shoeData, categoryId));
    return { shoe: toShoe(raw), message: 'Shoe listing published successfully' };
  },

  async updateShoe(id: string, updates: Partial<Shoe>): Promise<{ shoe: Shoe; message: string }> {
    // The API replaces the whole listing on PUT, so merge the changes into the current one first.
    const current = toShoe(await api.get<any>(`/shoes/${id}`));
    const merged: Shoe = { ...current, ...updates };
    const categoryId = await getCategoryId(merged.category);
    const raw = await api.put<any>(`/shoes/${id}`, fromShoe(merged, categoryId));
    return { shoe: toShoe(raw), message: 'Shoe details updated successfully' };
  },

  async deleteShoe(id: string): Promise<{ success: boolean; message: string }> {
    await api.delete<unknown>(`/shoes/${id}`); // 204 No Content on success
    return { success: true, message: 'Shoe listing removed' };
  },

  async updateStock(
    shoeId: string,
    size: number,
    newStock: number
  ): Promise<{ shoe: Shoe; message: string }> {
    const raw = await api.patch<any>(`/shoes/${shoeId}/stock`, { size, newStock });
    return { shoe: toShoe(raw), message: `Stock updated for size ${size}` };
  },
};
