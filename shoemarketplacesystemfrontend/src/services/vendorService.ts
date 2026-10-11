import { api } from './apiClient';
import { Vendor, Shoe } from '../types/marketplace';
import { fromVendorUpdates, toShoe, toVendor } from './adapters';

export const vendorService = {
  async getVendors(): Promise<{ vendors: Vendor[] }> {
    const list = await api.get<any[]>('/vendors');
    return { vendors: list.map(toVendor) };
  },

  async getVendorById(id: string): Promise<{ vendor: Vendor; shoes: Shoe[] }> {
    const [vendor, shoes] = await Promise.all([
      api.get<any>(`/vendors/${id}`),
      api.get<any[]>(`/shoes?vendorId=${encodeURIComponent(id)}`),
    ]);
    return { vendor: toVendor(vendor), shoes: shoes.map(toShoe) };
  },

  async updateVendorProfile(
    vendorId: string,
    updates: Partial<Vendor>
  ): Promise<{ vendor: Vendor; message: string }> {
    const raw = await api.put<any>(`/vendors/${vendorId}`, fromVendorUpdates(updates));
    return { vendor: toVendor(raw), message: 'Store profile updated successfully' };
  },

  async getAnalytics(): Promise<{
    totalProducts: number;
    pendingOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalSales: number;
    fulfillmentRate: number;
  }> {
    return api.get('/vendor/analytics');
  },
};
