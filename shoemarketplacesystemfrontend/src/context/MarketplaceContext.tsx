import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Shoe,
  Vendor,
  Buyer,
  CartItem,
  Order,
  OrderStatus,
  UserRole,
  FilterState,
  ShoeCategory,
} from '../types/marketplace';
import { authService, AuthResponse } from '../services/authService';
import { productService } from '../services/productService';
import { vendorService } from '../services/vendorService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { getAuthToken } from '../services/apiClient';

interface MarketplaceContextType {
  // Auth & Roles
  userRole: UserRole;
  currentUser: any | null;
  activeBuyer: Buyer | null;
  activeVendor: Vendor | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  registerBuyer: (payload: any) => Promise<AuthResponse>;
  registerVendor: (payload: any) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchDemoPersona: (persona: 'guest' | 'buyer' | 'vendor', specificVendorId?: string) => Promise<void>;

  // Navigation & Page State
  activePage: string;
  setActivePage: (page: string) => void;
  selectedShoeId: string | null;
  openShoeDetail: (shoeId: string) => void;
  selectedVendorId: string | null;
  openVendorStore: (vendorId: string) => void;

  // Dashboard Tabs
  buyerDashboardTab: string;
  setBuyerDashboardTab: (tab: string) => void;
  vendorDashboardTab: string;
  setVendorDashboardTab: (tab: string) => void;

  // Data
  shoes: Shoe[];
  totalShoesCount: number;
  vendors: Vendor[];
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  applySmartSearch: (query: string) => void;

  // Cart Operations
  addToCart: (shoeId: string, size: number, quantity?: number) => Promise<void>;
  updateCartQuantity: (cartItemId: string, delta: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartSubtotal: number;
  cartCount: number;

  // Favorites
  toggleFavorite: (shoeId: string) => void;
  isFavorite: (shoeId: string) => boolean;

  // Orders
  placeOrder: (payload: {
    customerName: string;
    phone: string;
    district: string;
    address: string;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectReason?: string) => Promise<void>;

  // Vendor Shoe CRUD
  addShoe: (shoeData: Partial<Shoe>) => Promise<Shoe>;
  updateShoe: (shoeId: string, updates: Partial<Shoe>) => Promise<Shoe>;
  deleteShoe: (shoeId: string) => Promise<void>;
  updateShoeStock: (shoeId: string, size: number, newStock: number) => Promise<void>;
  updateVendorProfile: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;

  // UI Toast
  toastMessage: string | null;
  showToast: (message: string) => void;

  // Contact vendor modal
  contactVendorShoe: Shoe | null;
  setContactVendorShoe: (shoe: Shoe | null) => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'All',
  brand: 'All',
  size: 'All',
  minPrice: 20000,
  maxPrice: 150000,
  condition: 'All',
  vendorId: 'All',
  sortBy: 'relevance',
};

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [activePage, setActivePageState] = useState<string>('home');
  const [selectedShoeId, setSelectedShoeId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const [buyerDashboardTab, setBuyerDashboardTab] = useState<string>('overview');
  const [vendorDashboardTab, setVendorDashboardTab] = useState<string>('overview');

  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [totalShoesCount, setTotalShoesCount] = useState<number>(0);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contactVendorShoe, setContactVendorShoe] = useState<Shoe | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const setActivePage = (page: string) => {
    setActivePageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openShoeDetail = (shoeId: string) => {
    setSelectedShoeId(shoeId);
    setActivePageState('shoe-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openVendorStore = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setActivePageState('vendor-store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Shoes based on filters
  const loadShoes = useCallback(async () => {
    try {
      const res = await productService.getShoes(filters);
      setShoes(res.shoes);
      setTotalShoesCount(res.total);
    } catch (err: any) {
      console.error('Failed loading shoes:', err);
      setError(err.message);
    }
  }, [filters]);

  // Load Vendors
  const loadVendors = useCallback(async () => {
    try {
      const res = await vendorService.getVendors();
      setVendors(res.vendors);
    } catch (err: any) {
      console.error('Failed loading vendors:', err);
    }
  }, []);

  // Load Cart
  const loadCart = useCallback(async () => {
    if (!getAuthToken()) {
      setCart([]);
      return;
    }
    try {
      const res = await cartService.getCart();
      setCart(res.cart);
    } catch (err: any) {
      console.error('Failed loading cart:', err);
    }
  }, []);

  // Load Orders
  const loadOrders = useCallback(async () => {
    if (!getAuthToken()) {
      setOrders([]);
      return;
    }
    try {
      const res = await orderService.getOrders();
      setOrders(res.orders);
    } catch (err: any) {
      console.error('Failed loading orders:', err);
    }
  }, []);

  // Initial user session verification
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (token) {
        try {
          const authData = await authService.getMe();
          setCurrentUser(authData.user);
          setUserRole(authData.role);
          setIsAuthenticated(true);
          if (authData.vendor) {
            setActiveVendor(authData.vendor);
          }
        } catch (err) {
          // Token expired or invalid
          console.warn('Session verification failed, continuing as guest');
          setUserRole('guest');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUserRole('guest');
      }

      await Promise.all([loadVendors(), loadShoes(), loadCart(), loadOrders()]);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Reload shoes whenever filters change
  useEffect(() => {
    loadShoes();
  }, [loadShoes]);

  const refreshData = async () => {
    await Promise.all([loadShoes(), loadVendors(), loadCart(), loadOrders()]);
  };

  // Auth actions
  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const res = await authService.login({ email, password: pass });
    setCurrentUser(res.user);
    setUserRole(res.role);
    setIsAuthenticated(true);
    if (res.vendor) {
      setActiveVendor(res.vendor);
    }
    showToast(`Signed in as ${res.user.fullName}`);
    await refreshData();
    return res;
  };

  const registerBuyer = async (payload: any): Promise<AuthResponse> => {
    const res = await authService.registerBuyer(payload);
    setCurrentUser(res.user);
    setUserRole('buyer');
    setIsAuthenticated(true);
    showToast(`Welcome to SoleLink, ${res.user.fullName}!`);
    await refreshData();
    return res;
  };

  const registerVendor = async (payload: any): Promise<AuthResponse> => {
    const res = await authService.registerVendor(payload);
    setCurrentUser(res.user);
    setUserRole('vendor');
    setIsAuthenticated(true);
    if (res.vendor) {
      setActiveVendor(res.vendor);
    }
    showToast(`Store registered! Welcome, ${res.vendor?.name || res.user.fullName}`);
    await refreshData();
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveVendor(null);
    setUserRole('guest');
    setIsAuthenticated(false);
    setCart([]);
    setOrders([]);
    setActivePage('home');
    showToast('Signed out of SoleLink');
  };

  // One-click demo persona switch that hits real backend credentials
  const switchDemoPersona = async (
    persona: 'guest' | 'buyer' | 'vendor',
    specificVendorId?: string
  ) => {
    if (persona === 'guest') {
      await logout();
      return;
    }

    if (persona === 'buyer') {
      await login('jeanluc.munyaneza@gmail.com', 'buyer1234');
      setActivePage('buyer-dashboard');
      setBuyerDashboardTab('overview');
      return;
    }

    if (persona === 'vendor') {
      // Pick vendor credentials based on selection
      if (specificVendorId === 'vendor-2') {
        await login('orders@kigalifootwear.rw', 'vendor1234');
      } else {
        await login('hello@urbansole.rw', 'vendor1234');
      }
      setActivePage('vendor-dashboard');
      setVendorDashboardTab('overview');
    }
  };

  // Cart operations
  const addToCart = async (shoeId: string, size: number, quantity = 1) => {
    if (!isAuthenticated || userRole !== 'buyer') {
      // Auto-authenticate as buyer for smooth purchasing or prompt
      await login('jeanluc.munyaneza@gmail.com', 'buyer1234');
    }

    try {
      const res = await cartService.addToCart(shoeId, size, quantity);
      setCart(res.cart);
      showToast(res.message || 'Added shoe to shopping bag');
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to bag');
      throw err;
    }
  };

  const updateCartQuantity = async (cartItemId: string, delta: number) => {
    try {
      const res = await cartService.updateQuantity(cartItemId, delta);
      setCart(res.cart);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await cartService.removeItem(cartItemId);
      setCart(res.cart);
      showToast('Item removed from cart');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      setCart(res.cart);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Orders
  const placeOrder = async (payload: {
    customerName: string;
    phone: string;
    district: string;
    address: string;
    notes?: string;
  }): Promise<Order> => {
    if (!isAuthenticated) {
      await login('jeanluc.munyaneza@gmail.com', 'buyer1234');
    }

    const res = await orderService.placeOrder(payload);
    setCart([]);
    await refreshData();
    showToast(res.message);
    return res.order;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    rejectReason?: string
  ) => {
    const res = await orderService.updateStatus(orderId, status, rejectReason);
    showToast(res.message);
    await refreshData();
  };

  // Vendor Shoe CRUD
  const addShoe = async (shoeData: Partial<Shoe>): Promise<Shoe> => {
    const res = await productService.createShoe(shoeData);
    showToast(res.message);
    await refreshData();
    return res.shoe;
  };

  const updateShoe = async (shoeId: string, updates: Partial<Shoe>): Promise<Shoe> => {
    const res = await productService.updateShoe(shoeId, updates);
    showToast(res.message);
    await refreshData();
    return res.shoe;
  };

  const deleteShoe = async (shoeId: string) => {
    const res = await productService.deleteShoe(shoeId);
    showToast(res.message);
    await refreshData();
  };

  const updateShoeStock = async (shoeId: string, size: number, newStock: number) => {
    const res = await productService.updateStock(shoeId, size, newStock);
    showToast(res.message);
    await refreshData();
  };

  const updateVendorProfile = async (vendorId: string, updates: Partial<Vendor>) => {
    const res = await vendorService.updateVendorProfile(vendorId, updates);
    showToast(res.message);
    await refreshData();
  };

  // Favorites
  const toggleFavorite = (shoeId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(shoeId);
      const next = exists ? prev.filter((id) => id !== shoeId) : [...prev, shoeId];
      showToast(exists ? 'Removed from saved shoes' : 'Saved to favorites');
      return next;
    });
  };

  const isFavorite = (shoeId: string) => favorites.includes(shoeId);

  // Filters
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const applySmartSearch = (query: string) => {
    const qLower = query.toLowerCase().trim();
    const newFilters = { ...DEFAULT_FILTERS, searchQuery: query };

    const categories: ShoeCategory[] = ['Sneakers', 'Running', 'Formal', 'Boots', 'Sandals', 'Casual'];
    for (const cat of categories) {
      if (qLower.includes(cat.toLowerCase())) {
        newFilters.category = cat;
        break;
      }
    }

    if (qLower.includes('new') && !qLower.includes('like new')) {
      newFilters.condition = 'New';
    } else if (qLower.includes('used') || qLower.includes('second hand')) {
      newFilters.condition = 'Used - Like New';
    }

    const sizeMatch = qLower.match(/\b(3[6-9]|4[0-6])\b/);
    if (sizeMatch) {
      newFilters.size = parseInt(sizeMatch[1], 10);
    }

    setFilters(newFilters);
    setActivePage('shop');
  };

  // Convert currentUser to activeBuyer if role is buyer
  const activeBuyer: Buyer | null =
    currentUser && currentUser.role === 'buyer'
      ? {
          id: currentUser.id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          phone: currentUser.phone,
          district: currentUser.district || 'Gasabo',
          address: currentUser.address || 'Kigali, Rwanda',
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        }
      : null;

  return (
    <MarketplaceContext.Provider
      value={{
        userRole,
        currentUser,
        activeBuyer,
        activeVendor,
        isAuthenticated,
        login,
        registerBuyer,
        registerVendor,
        logout,
        switchDemoPersona,
        activePage,
        setActivePage,
        selectedShoeId,
        openShoeDetail,
        selectedVendorId,
        openVendorStore,
        buyerDashboardTab,
        setBuyerDashboardTab,
        vendorDashboardTab,
        setVendorDashboardTab,
        shoes,
        totalShoesCount,
        vendors,
        cart,
        favorites,
        orders,
        isLoading,
        error,
        refreshData,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        applySmartSearch,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        toggleFavorite,
        isFavorite,
        placeOrder,
        updateOrderStatus,
        addShoe,
        updateShoe,
        deleteShoe,
        updateShoeStock,
        updateVendorProfile,
        toastMessage,
        showToast,
        contactVendorShoe,
        setContactVendorShoe,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
