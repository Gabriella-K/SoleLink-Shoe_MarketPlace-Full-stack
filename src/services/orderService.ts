import { api } from './apiClient';
import { Order, OrderStatus } from '../types/marketplace';

export const orderService = {
  async getOrders(): Promise<{ orders: Order[] }> {
    return api.get<{ orders: Order[] }>('/orders');
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    return api.get<{ order: Order }>(`/orders/${id}`);
  },

  async placeOrder(payload: {
    customerName: string;
    phone: string;
    district: string;
    address: string;
    notes?: string;
  }): Promise<{ order: Order; message: string }> {
    return api.post<{ order: Order; message: string }>('/orders', payload);
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    rejectReason?: string
  ): Promise<{ order: Order; message: string }> {
    return api.patch<{ order: Order; message: string }>(`/orders/${orderId}/status`, {
      status,
      rejectReason,
    });
  },
};
