export type ShoeCategory = 'Sneakers' | 'Running' | 'Formal' | 'Boots' | 'Sandals' | 'Casual';

export type ShoeCondition = 'New' | 'Used - Like New' | 'Used - Good';

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo: string;
  coverImage: string;
  location: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  about: string;
  joinedYear: number;
}

export interface Shoe {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  brand: string;
  category: ShoeCategory;
  price: number; // in RWF
  originalPrice?: number;
  condition: ShoeCondition;
  sizes: number[];
  stock: Record<number, number>; // size -> quantity
  color: string;
  material: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Buyer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  avatar: string;
}

export interface CartItem {
  id: string;
  shoeId: string;
  vendorId: string;
  size: number;
  quantity: number;
  price: number;
  shoe: Shoe;
  vendor: Vendor;
}

export interface OrderItem {
  shoeId: string;
  shoeName: string;
  brand: string;
  image: string;
  vendorId: string;
  vendorName: string;
  size: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: string; // e.g. "SL-2026-8910"
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerDistrict: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  vendorIds: string[];
}

export type UserRole = 'guest' | 'buyer' | 'vendor';

export interface FilterState {
  searchQuery: string;
  category: ShoeCategory | 'All';
  brand: string | 'All';
  size: number | 'All';
  minPrice: number;
  maxPrice: number;
  condition: ShoeCondition | 'All';
  vendorId: string | 'All';
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}
