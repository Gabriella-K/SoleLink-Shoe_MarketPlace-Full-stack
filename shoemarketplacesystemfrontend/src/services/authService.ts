import { api, setAuthToken, removeAuthToken } from './apiClient';
import { Buyer, Vendor, UserRole } from '../types/marketplace';
import { toAuthResponse } from './adapters';

export interface AuthResponse {
  user: {
    id: string;
    role: UserRole;
    email: string;
    fullName: string;
    phone: string;
    district?: string;
    address?: string;
    avatar?: string;
    vendorId?: string;
  };
  vendor?: Vendor;
  token: string;
  role: UserRole;
  message?: string;
}

export const authService = {
  async registerBuyer(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    district?: string;
    address?: string;
  }): Promise<AuthResponse> {
    const res = toAuthResponse(await api.post<AuthResponse>('/auth/register-buyer', payload));
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async registerVendor(payload: {
    ownerName: string;
    shopName: string;
    email: string;
    phone: string;
    location: string;
    password: string;
    confirmPassword: string;
    about?: string;
    address?: string;
  }): Promise<AuthResponse> {
    const res = toAuthResponse(await api.post<AuthResponse>('/auth/register-vendor', payload));
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = toAuthResponse(await api.post<AuthResponse>('/auth/login', payload));
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ user: any; vendor?: Vendor; role: UserRole }> {
    return toAuthResponse(await api.get<{ user: any; vendor?: Vendor; role: UserRole }>('/auth/me'));
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      removeAuthToken();
    }
  },
};
