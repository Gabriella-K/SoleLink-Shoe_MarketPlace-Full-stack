/**
 * Adapters between the Spring Boot backend's JSON and the shapes the React UI uses.
 *
 * Why this file exists: the Java API returns plain entities
 * (e.g. a Shoe has `vendor`, `category: {id,name}`, `stocks: [{size, quantity}]`,
 *  conditions like USED_LIKE_NEW, order statuses like PENDING), while the UI was
 * built around `vendorId`, `category: 'Running'`, `stock: {42: 3}`,
 * 'Used - Like New', 'Pending', etc. Everything that differs is converted here,
 * so no component has to change.
 */
import {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  Shoe,
  ShoeCategory,
  ShoeCondition,
  Vendor,
} from '../types/marketplace';

// ---------------------------------------------------------------- constants

const CONDITION_FROM_API: Record<string, ShoeCondition> = {
  NEW: 'New',
  USED_LIKE_NEW: 'Used - Like New',
  USED_GOOD: 'Used - Good',
};

const CONDITION_TO_API: Record<string, string> = {
  New: 'NEW',
  'Used - Like New': 'USED_LIKE_NEW',
  'Used - Good': 'USED_GOOD',
};

export const conditionToApi = (c: string | undefined): string =>
  (c && CONDITION_TO_API[c]) || 'NEW';

const DEFAULT_SHOE_IMAGE =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';

// ------------------------------------------------------------------ helpers

export const slugify = (text: string | undefined | null): string =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Java's LocalDateTime may arrive as "2026-10-10T13:29:00.123" or [2026,10,10,13,29,0,...]. */
export function toIso(value: any): string {
  if (!value) return new Date().toISOString();
  if (Array.isArray(value)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = value;
    return new Date(y, mo - 1, d, h, mi, s).toISOString();
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

const capitalize = (text: string): string =>
  text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;

// ------------------------------------------------------------------- vendor

export function toVendor(v: any): Vendor {
  const name = v?.name ?? '';
  return {
    id: v.id,
    name,
    slug: slugify(name),
    tagline: v.tagline ?? 'Authentic local footwear boutique',
    logo:
      v.logo ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name || 'store')}`,
    coverImage: v.coverImage || DEFAULT_COVER,
    location: v.location ?? '',
    district: v.district ?? '',
    address: v.address ?? '',
    phone: v.phone ?? '',
    email: v.email ?? '',
    openingHours: v.openingHours ?? 'Mon – Sat: 9:00 AM – 8:00 PM',
    rating: v.rating ?? 0,
    reviewCount: v.reviewCount ?? 0,
    verified: !!v.verified,
    about: v.about ?? '',
    joinedYear: new Date(toIso(v.createdAt)).getFullYear(),
  };
}

/** Only the fields the backend lets a vendor edit; undefined fields are left untouched server-side. */
export function fromVendorUpdates(updates: Partial<Vendor>): Record<string, any> {
  const allowed: (keyof Vendor)[] = [
    'name',
    'tagline',
    'logo',
    'coverImage',
    'location',
    'district',
    'address',
    'phone',
    'openingHours',
    'about',
  ];
  const body: Record<string, any> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) body[key] = updates[key];
  }
  return body;
}

// --------------------------------------------------------------------- shoe

export function toShoe(s: any): Shoe {
  const stock: Record<number, number> = {};
  for (const st of s.stocks ?? []) {
    stock[st.size] = st.quantity;
  }
  const sizes = Object.keys(stock)
    .map(Number)
    .sort((a, b) => a - b);

  return {
    id: s.id,
    vendorId: s.vendor?.id,
    name: s.name,
    slug: slugify(s.name),
    brand: s.brand,
    category: (s.category?.name ?? 'Casual') as ShoeCategory,
    price: s.price,
    originalPrice: s.originalPrice ?? undefined,
    condition: CONDITION_FROM_API[s.condition] ?? 'New',
    sizes,
    stock,
    color: s.color ?? '',
    material: s.material ?? '',
    description: s.description ?? '',
    images: s.images && s.images.length > 0 ? s.images : [DEFAULT_SHOE_IMAGE],
    rating: s.rating ?? 0,
    reviewCount: s.reviewCount ?? 0,
    isBestSeller: !!s.bestSeller,
    isFeatured: !!s.featured,
    createdAt: toIso(s.createdAt),
  };
}

/**
 * UI Shoe -> request body for POST/PUT /api/shoes.
 * `categoryId` must be resolved by the caller (the API wants an id, the UI has a name).
 */
export function fromShoe(shoe: Partial<Shoe>, categoryId: string): Record<string, any> {
  const stock = shoe.stock ?? {};
  const sizeSet = new Set<number>([
    ...(shoe.sizes ?? []).map(Number),
    ...Object.keys(stock).map(Number),
  ]);
  const stocks = [...sizeSet]
    .sort((a, b) => a - b)
    .map((size) => ({ size, quantity: Number(stock[size] ?? 0) }));

  return {
    name: shoe.name,
    brand: shoe.brand,
    price: Number(shoe.price),
    originalPrice: shoe.originalPrice ? Number(shoe.originalPrice) : null,
    condition: conditionToApi(shoe.condition),
    color: shoe.color || 'Classic',
    material: shoe.material || 'Leather',
    description: shoe.description || '',
    bestSeller: !!shoe.isBestSeller,
    featured: !!shoe.isFeatured,
    category: { id: categoryId },
    images: shoe.images && shoe.images.length > 0 ? shoe.images : [DEFAULT_SHOE_IMAGE],
    stocks,
  };
}

// --------------------------------------------------------------------- cart

export function toCartItem(item: any): CartItem {
  return {
    id: item.id,
    shoeId: item.shoe.id,
    vendorId: item.shoe.vendor?.id,
    size: item.size,
    quantity: item.quantity,
    price: item.shoe.price,
    shoe: toShoe(item.shoe),
    vendor: toVendor(item.shoe.vendor),
  };
}

/** The API returns the whole Cart ({id, items: [...]}); the UI wants just the item list. */
export function toCartItems(cart: any): CartItem[] {
  return (cart?.items ?? []).map(toCartItem);
}

// -------------------------------------------------------------------- order

export function toOrderStatus(status: string): OrderStatus {
  return capitalize(status) as OrderStatus;
}

export function toOrder(o: any): Order {
  const items: OrderItem[] = (o.items ?? []).map((it: any) => ({
    shoeId: it.shoe?.id,
    shoeName: it.shoeName,
    brand: it.brand,
    image: it.image || DEFAULT_SHOE_IMAGE,
    vendorId: it.vendor?.id,
    vendorName: it.vendor?.name ?? '',
    size: it.size,
    quantity: it.quantity,
    price: it.price,
  }));

  return {
    id: o.orderNumber, // the UI shows/uses the readable number, e.g. SL-2026-8910
    buyerId: o.buyer?.id,
    buyerName: o.customerName,
    buyerEmail: o.buyer?.email ?? '',
    buyerPhone: o.phone,
    buyerAddress: o.address,
    buyerDistrict: o.district,
    deliveryNotes: o.deliveryNotes ?? undefined,
    items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: toOrderStatus(o.status),
    rejectReason: o.rejectReason ?? undefined,
    createdAt: toIso(o.createdAt),
    updatedAt: toIso(o.createdAt), // backend does not track updatedAt
    vendorIds: [...new Set(items.map((i) => i.vendorId))],
  };
}

// --------------------------------------------------------------------- auth

/** Normalises the `vendor` object inside auth responses; leaves everything else alone. */
export function toAuthResponse<T extends { vendor?: any }>(res: T): T {
  return { ...res, vendor: res.vendor ? toVendor(res.vendor) : undefined };
}
