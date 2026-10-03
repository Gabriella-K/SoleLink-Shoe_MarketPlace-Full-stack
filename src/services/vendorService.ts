import { api } from './apiClient';
import { Vendor, Shoe } from '../types/marketplace';

export const vendorService = {
  async getVendors(): Promise<{ vendors: Vendor[] }> {
    return api.get<{ vendors: Vendor[] }>('/vendors');
  },

  async getVendorById(id: string): Promise<{ vendor: Vendor; shoes: Shoe[] }> {
    return api.get<{ vendor: Vendor; shoes: Shoe[] }>(`/vendors/${id}`);
  },

  async updateVendorProfile(
    vendorId: string,
    updates: Partial<Vendor>
  ): Promise<{ vendor: Vendor; message: string }> {
    return api.put<{ vendor: Vendor; message: string }>(`/vendors/${vendorId}`, updates);
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
