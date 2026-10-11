import { api } from './apiClient';
import { Order, OrderStatus } from '../types/marketplace';
import { toOrder } from './adapters';

export const orderService = {
  async getOrders(): Promise<{ orders: Order[] }> {
    const list = await api.get<any[]>('/orders');
    return { orders: list.map(toOrder) };
  },

  // `id` is the readable order number (e.g. SL-2026-8910), which is what the API looks orders up by.
  async getOrderById(id: string): Promise<{ order: Order }> {
    return { order: toOrder(await api.get<any>(`/orders/${encodeURIComponent(id)}`)) };
  },

  async placeOrder(payload: {
    customerName: string;
    phone: string;
    district: string;
    address: string;
    notes?: string;
  }): Promise<{ order: Order; message: string }> {
    const raw = await api.post<any>('/orders', {
      customerName: payload.customerName,
      phone: payload.phone,
      district: payload.district,
      address: payload.address,
      deliveryNotes: payload.notes, // UI calls it "notes", the API calls it "deliveryNotes"
    });
    const order = toOrder(raw);
    return { order, message: `Order ${order.id} placed successfully` };
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    rejectReason?: string
  ): Promise<{ order: Order; message: string }> {
    // API upper-cases the status itself ('Accepted' -> ACCEPTED)
    const raw = await api.patch<any>(`/orders/${encodeURIComponent(orderId)}/status`, {
      status,
      rejectReason,
    });
    return { order: toOrder(raw), message: `Order marked as ${status}` };
  },
};
