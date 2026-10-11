import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type UserRole = 'buyer' | 'vendor';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  district?: string;
  address?: string;
  avatar?: string;
  vendorId?: string; // If role === 'vendor'
  createdAt: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  district: string;
  address: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  about: string;
  tagline: string;
  joinedYear: number;
  logo: string;
  coverImage: string;
}

export type ShoeCategory = 'Sneakers' | 'Running' | 'Formal' | 'Boots' | 'Sandals' | 'Casual';
export type ShoeCondition = 'New' | 'Used - Like New' | 'Used - Good';

export interface ShoeRecord {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  brand: string;
  category: ShoeCategory;
  price: number;
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

export interface CartItemRecord {
  id: string;
  shoeId: string;
  vendorId: string;
  size: number;
  quantity: number;
  price: number;
  shoe?: ShoeRecord;
  vendor?: VendorRecord;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface OrderItemRecord {
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

export interface OrderRecord {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerDistrict: string;
  deliveryNotes?: string;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  vendorIds: string[];
}

export interface DatabaseSchema {
  users: User[];
  vendors: VendorRecord[];
  shoes: ShoeRecord[];
  carts: Record<string, CartItemRecord[]>; // userId -> items
  orders: OrderRecord[];
  favorites: Record<string, string[]>; // userId -> shoeIds
  sessions: Record<string, { userId: string; role: UserRole; expiresAt: number }>; // token -> session
}

const DB_FILE = path.resolve(process.cwd(), 'data/solelink_db.json');

// Helper to hash passwords securely
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'solelink_salt_2026').digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initial seed data
function getInitialSeed(): DatabaseSchema {
  const buyerPass = hashPassword('buyer1234');
  const vendorPass = hashPassword('vendor1234');

  const users: User[] = [
    {
      id: 'usr-buyer-1',
      role: 'buyer',
      email: 'jeanluc.munyaneza@gmail.com',
      passwordHash: buyerPass,
      fullName: 'Jean-Luc Munyaneza',
      phone: '+250 788 345 678',
      district: 'Gasabo, Kigali',
      address: 'KG 14 Ave, House 22, Kacyiru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: 'usr-vendor-1',
      role: 'vendor',
      email: 'hello@urbansole.rw',
      passwordHash: vendorPass,
      fullName: 'Eric Habimana',
      phone: '+250 788 123 456',
      district: 'Gasabo, Kigali',
      address: 'KG 7 Ave, Kigali Heights Mall, Suite 104',
      vendorId: 'vendor-1',
      createdAt: '2026-07-15T09:00:00Z',
    },
    {
      id: 'usr-vendor-2',
      role: 'vendor',
      email: 'orders@kigalifootwear.rw',
      passwordHash: vendorPass,
      fullName: 'Patrick Mugisha',
      phone: '+250 785 987 654',
      district: 'Nyarugenge, Kigali',
      address: 'KN 2 Ave, Heritage Plaza 2nd Floor',
      vendorId: 'vendor-2',
      createdAt: '2026-07-20T10:00:00Z',
    },
  ];

  const vendors: VendorRecord[] = [
    {
      id: 'vendor-1',
      name: 'Urban Sole',
      slug: 'urban-sole',
      ownerName: 'Eric Habimana',
      tagline: 'Modern urban footwear, lifestyle runners, and court classics',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
      location: 'Kigali Heights, Level 1',
      district: 'Gasabo, Kigali',
      address: 'KG 7 Ave, Kigali Heights Mall, Suite 104',
      phone: '+250 788 123 456',
      email: 'hello@urbansole.rw',
      openingHours: 'Mon – Sat: 9:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM',
      rating: 4.9,
      reviewCount: 142,
      verified: true,
      about: 'Urban Sole is an independent boutique footwear destination founded in 2021 at Kigali Heights. We curate authentic streetwear, modern minimalism, and performance lifestyle sneakers for everyday city movement.',
      joinedYear: 2022,
    },
    {
      id: 'vendor-2',
      name: 'Kigali Footwear',
      slug: 'kigali-footwear',
      ownerName: 'Patrick Mugisha',
      tagline: 'Artisanal leather shoes, handcrafted dress wear & Chelsea boots',
      logo: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80',
      location: 'Nyarugenge Commercial District',
      district: 'Nyarugenge, Kigali',
      address: 'KN 2 Ave, Heritage Plaza 2nd Floor',
      phone: '+250 785 987 654',
      email: 'orders@kigalifootwear.rw',
      openingHours: 'Mon – Fri: 8:30 AM – 7:30 PM | Sat: 9:00 AM – 6:00 PM',
      rating: 4.8,
      reviewCount: 98,
      verified: true,
      about: 'Specialists in premium calfskin dress shoes, burnished brogues, and handcrafted suede Chelsea boots. Kigali Footwear partners with master leather artisans to bring timeless elegance to Rwandan professionals.',
      joinedYear: 2021,
    },
    {
      id: 'vendor-3',
      name: 'Step House',
      slug: 'step-house',
      ownerName: 'Aline Uwase',
      tagline: 'High-mileage road running, cross-trainers & trail sneakers',
      logo: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      location: 'Kimironko Hub',
      district: 'Gasabo, Kigali',
      address: 'KG 11 Ave, Near Kimironko Market Galleria',
      phone: '+250 783 456 789',
      email: 'info@stephouse.rw',
      openingHours: 'Mon – Sun: 8:00 AM – 8:30 PM',
      rating: 4.9,
      reviewCount: 184,
      verified: true,
      about: 'Kigali’s prime athletic running shop. Whether training for the Kigali International Peace Marathon or evening runs on KG 9, Step House supplies verified authentic performance running models with foot mapping advice.',
      joinedYear: 2020,
    },
    {
      id: 'vendor-4',
      name: 'The Sneaker Hub',
      slug: 'the-sneaker-hub',
      ownerName: 'David Nshimiyimana',
      tagline: 'Rare collector deadstocks, retro skate shoes & high-tops',
      logo: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
      location: 'Remera Sports Zone',
      district: 'Kicukiro / Remera, Kigali',
      address: 'KG 17 Ave, Adjacent Amahoro Stadium Gate 3',
      phone: '+250 782 112 233',
      email: 'support@sneakerhub.rw',
      openingHours: 'Mon – Sat: 10:00 AM – 9:00 PM',
      rating: 4.7,
      reviewCount: 76,
      verified: true,
      about: 'The cultural center for sneakerheads in Rwanda. Established near Amahoro National Stadium, The Sneaker Hub bridges vintage basketball heritage with contemporary limited releases.',
      joinedYear: 2023,
    },
  ];

  const shoes: ShoeRecord[] = [
    {
      id: 'shoe-1',
      vendorId: 'vendor-1',
      name: 'Stride Runner',
      slug: 'stride-runner',
      brand: 'SoleLink Lab',
      category: 'Running',
      price: 72000,
      originalPrice: 85000,
      condition: 'New',
      sizes: [40, 41, 42, 43, 44],
      stock: { 40: 3, 41: 5, 42: 2, 43: 4, 44: 1 },
      color: 'Chalk White & Raw Terracotta',
      material: 'Engineered breathable knit upper, responsive EVA cushioning',
      description: 'The Stride Runner brings seamless architectural simplicity to high-mileage road running. Featuring dual-density foam midsoles, contoured arch support, and lightweight recycled mesh that adapts naturally to your stride.',
      images: ['/src/assets/images/product_stride_runner_1791024866210.jpg', '/src/assets/images/hero_editorial_sneakers_1791024851058.jpg'],
      rating: 4.9,
      reviewCount: 46,
      isBestSeller: true,
      isFeatured: true,
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'shoe-2',
      vendorId: 'vendor-1',
      name: 'Urban Classic Low',
      slug: 'urban-classic-low',
      brand: 'Urban Core',
      category: 'Sneakers',
      price: 54000,
      originalPrice: 62000,
      condition: 'New',
      sizes: [39, 40, 41, 42, 43],
      stock: { 39: 4, 40: 6, 41: 3, 42: 5, 43: 2 },
      color: 'Alabaster & Minimal Grey',
      material: 'Full-grain Italian Nappa leather, vulcanized rubber sole',
      description: 'Clean-line streetwear stripped of excess branding. Hand-stitched cupsole construction offers durability that softens with time, making it the quintessential everyday wardrobe staple.',
      images: ['/src/assets/images/hero_editorial_sneakers_1791024851058.jpg', '/src/assets/images/product_stride_runner_1791024866210.jpg'],
      rating: 4.8,
      reviewCount: 68,
      isBestSeller: true,
      isFeatured: true,
      createdAt: '2026-08-10T12:00:00Z',
    },
    {
      id: 'shoe-3',
      vendorId: 'vendor-2',
      name: 'Thrivo Oxford Derby',
      slug: 'thrivo-oxford-derby',
      brand: 'Kigali Artisan',
      category: 'Formal',
      price: 95000,
      originalPrice: 110000,
      condition: 'New',
      sizes: [40, 41, 42, 43, 44, 45],
      stock: { 40: 2, 41: 4, 42: 3, 43: 2, 44: 2, 45: 1 },
      color: 'Onyx Polished Black',
      material: 'Full-grain calfskin leather, Goodyear-welted double leather sole',
      description: 'Handcrafted with traditional bench-grade techniques, the Thrivo Oxford features razor-sharp toe shaping, subtle perforation, and deep vegetable-tanned luster for formal boardrooms and celebratory events.',
      images: ['/src/assets/images/product_urban_derby_1791024877822.jpg', '/src/assets/images/category_formal_leather_1791024899606.jpg'],
      rating: 4.9,
      reviewCount: 38,
      isBestSeller: true,
      isFeatured: true,
      createdAt: '2026-07-20T14:30:00Z',
    },
    {
      id: 'shoe-4',
      vendorId: 'vendor-2',
      name: 'Chelsea Essential Suede',
      slug: 'chelsea-essential-suede',
      brand: 'Atelier Heritage',
      category: 'Boots',
      price: 88000,
      originalPrice: 98000,
      condition: 'New',
      sizes: [40, 41, 42, 43, 44],
      stock: { 40: 2, 41: 2, 42: 1, 43: 3, 44: 1 },
      color: 'Sand Taupe',
      material: 'Silky calf suede upper, heavy-duty elastic gore, stacked leather heel',
      description: 'An understated icon. Cut from weather-treated velvety suede with sleek Chelsea pull tabs and an ergonomic cushioned insole designed for effortless all-day city transit.',
      images: ['/src/assets/images/product_chelsea_boot_1791024888794.jpg', '/src/assets/images/product_urban_derby_1791024877822.jpg'],
      rating: 4.8,
      reviewCount: 52,
      isBestSeller: true,
      isFeatured: true,
      createdAt: '2026-08-01T09:15:00Z',
    },
    {
      id: 'shoe-5',
      vendorId: 'vendor-1',
      name: 'Metro Court Sneaker',
      slug: 'metro-court-sneaker',
      brand: 'Urban Core',
      category: 'Sneakers',
      price: 62000,
      condition: 'New',
      sizes: [38, 39, 40, 41, 42, 43],
      stock: { 38: 2, 39: 3, 40: 5, 41: 4, 42: 6, 43: 2 },
      color: 'Warm Sand / Off-White',
      material: 'Premium tumbled leather, perforated toe box, rubber outsole',
      description: 'Vintage 80s court silhouette re-imagined with modern lightweight flexibility and supportive ankle padding. Clean lines with zero unnecessary frills.',
      images: ['/src/assets/images/hero_editorial_sneakers_1791024851058.jpg', '/src/assets/images/product_stride_runner_1791024866210.jpg'],
      rating: 4.7,
      reviewCount: 29,
      isBestSeller: false,
      isFeatured: false,
      createdAt: '2026-08-18T11:00:00Z',
    },
    {
      id: 'shoe-6',
      vendorId: 'vendor-3',
      name: 'Motion Trainer Pro',
      slug: 'motion-trainer-pro',
      brand: 'AeroStep',
      category: 'Running',
      price: 78000,
      originalPrice: 90000,
      condition: 'New',
      sizes: [41, 42, 43, 44, 45],
      stock: { 41: 3, 42: 4, 43: 3, 44: 2, 45: 2 },
      color: 'Slate Charcoal & Lime Accent',
      material: 'Engineered jacquard weave, carbon-infused torsion plate',
      description: 'Engineered for tempo training and marathon endurance. Features an ultra-responsive rocker geometry that drives forward momentum with minimal energy fatigue.',
      images: ['/src/assets/images/product_stride_runner_1791024866210.jpg', '/src/assets/images/hero_editorial_sneakers_1791024851058.jpg'],
      rating: 4.9,
      reviewCount: 41,
      isBestSeller: true,
      isFeatured: true,
      createdAt: '2026-08-12T16:00:00Z',
    },
    {
      id: 'shoe-7',
      vendorId: 'vendor-2',
      name: 'Kigali Monkstrap Formal',
      slug: 'kigali-monkstrap-formal',
      brand: 'Kigali Artisan',
      category: 'Formal',
      price: 110000,
      condition: 'New',
      sizes: [40, 41, 42, 43, 44],
      stock: { 40: 1, 41: 3, 42: 2, 43: 2, 44: 1 },
      color: 'Burnished Chestnut Brown',
      material: 'Hand-patinated vegetable tanned box-calf, brass buckle hardware',
      description: 'Double monk strap shoe with sharp almond toe profile. Each pair undergoes twelve hand-finishing tint cycles to achieve deep, rich color transitions in the leather.',
      images: ['/src/assets/images/category_formal_leather_1791024899606.jpg', '/src/assets/images/product_urban_derby_1791024877822.jpg'],
      rating: 4.8,
      reviewCount: 22,
      isBestSeller: false,
      isFeatured: false,
      createdAt: '2026-08-05T08:45:00Z',
    },
    {
      id: 'shoe-8',
      vendorId: 'vendor-4',
      name: 'Street Low Retro',
      slug: 'street-low-retro',
      brand: 'Nike Retro',
      category: 'Sneakers',
      price: 68000,
      originalPrice: 80000,
      condition: 'Used - Like New',
      sizes: [41, 42, 43],
      stock: { 41: 1, 42: 1, 43: 1 },
      color: 'Monochrome Black & Summit White',
      material: 'Smooth leather upper with suede overlays, herringbone traction',
      description: 'Curated deadstock condition. Carefully authenticated by The Sneaker Hub in Remera. Original insoles, clean tread, pristine leather upper.',
      images: ['/src/assets/images/hero_editorial_sneakers_1791024851058.jpg', '/src/assets/images/product_stride_runner_1791024866210.jpg'],
      rating: 4.7,
      reviewCount: 19,
      isBestSeller: true,
      isFeatured: false,
      createdAt: '2026-08-22T13:20:00Z',
    },
    {
      id: 'shoe-9',
      vendorId: 'vendor-2',
      name: 'Rwandan Safari Desert Boot',
      slug: 'rwandan-safari-desert-boot',
      brand: 'Atelier Heritage',
      category: 'Boots',
      price: 82000,
      condition: 'New',
      sizes: [39, 40, 41, 42, 43, 44],
      stock: { 39: 2, 40: 4, 41: 3, 42: 4, 43: 2, 44: 2 },
      color: 'Raw Nubuck Tan',
      material: 'Natural nubuck leather, plantation crepe natural rubber sole',
      description: 'Constructed for terrain versatility from the hills of Musanze to downtown Kigali meetings. Natural crepe rubber absorbs impact with silent grip.',
      images: ['/src/assets/images/product_chelsea_boot_1791024888794.jpg', '/src/assets/images/category_formal_leather_1791024899606.jpg'],
      rating: 4.8,
      reviewCount: 31,
      isBestSeller: false,
      isFeatured: false,
      createdAt: '2026-08-14T09:00:00Z',
    },
    {
      id: 'shoe-10',
      vendorId: 'vendor-1',
      name: 'Nyungwe Leather Slide',
      slug: 'nyungwe-leather-slide',
      brand: 'SoleLink Lab',
      category: 'Sandals',
      price: 38000,
      originalPrice: 45000,
      condition: 'New',
      sizes: [38, 39, 40, 41, 42, 43],
      stock: { 38: 4, 39: 5, 40: 6, 41: 5, 42: 3, 43: 2 },
      color: 'Caramel Brown & Brass Rivet',
      material: 'Aniline leather cross-strap, molded cork-latex footbed',
      description: 'Ergonomic anatomical footbed lined with breathable suede. Shapes itself to your unique foot arch over time for unparalleled weekend ease.',
      images: ['/src/assets/images/category_formal_leather_1791024899606.jpg', '/src/assets/images/product_chelsea_boot_1791024888794.jpg'],
      rating: 4.9,
      reviewCount: 57,
      isBestSeller: false,
      isFeatured: false,
      createdAt: '2026-07-28T15:10:00Z',
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: 'SL-2026-8910',
      buyerId: 'usr-buyer-1',
      buyerName: 'Jean-Luc Munyaneza',
      buyerEmail: 'jeanluc.munyaneza@gmail.com',
      buyerPhone: '+250 788 345 678',
      buyerAddress: 'KG 14 Ave, House 22, Kacyiru',
      buyerDistrict: 'Gasabo, Kigali',
      deliveryNotes: 'Please ring the black gate buzzer upon arrival.',
      items: [
        {
          shoeId: 'shoe-1',
          shoeName: 'Stride Runner',
          brand: 'SoleLink Lab',
          image: '/src/assets/images/product_stride_runner_1791024866210.jpg',
          vendorId: 'vendor-1',
          vendorName: 'Urban Sole',
          size: 42,
          quantity: 1,
          price: 72000,
        },
      ],
      subtotal: 72000,
      deliveryFee: 2500,
      total: 74500,
      status: 'Preparing',
      createdAt: '2026-10-02T14:20:00Z',
      updatedAt: '2026-10-02T16:00:00Z',
      vendorIds: ['vendor-1'],
    },
    {
      id: 'SL-2026-8842',
      buyerId: 'usr-buyer-1',
      buyerName: 'Jean-Luc Munyaneza',
      buyerEmail: 'jeanluc.munyaneza@gmail.com',
      buyerPhone: '+250 788 345 678',
      buyerAddress: 'KG 14 Ave, House 22, Kacyiru',
      buyerDistrict: 'Gasabo, Kigali',
      items: [
        {
          shoeId: 'shoe-3',
          shoeName: 'Thrivo Oxford Derby',
          brand: 'Kigali Artisan',
          image: '/src/assets/images/product_urban_derby_1791024877822.jpg',
          vendorId: 'vendor-2',
          vendorName: 'Kigali Footwear',
          size: 42,
          quantity: 1,
          price: 95000,
        },
      ],
      subtotal: 95000,
      deliveryFee: 2500,
      total: 97500,
      status: 'Completed',
      createdAt: '2026-09-24T11:00:00Z',
      updatedAt: '2026-09-25T15:30:00Z',
      vendorIds: ['vendor-2'],
    },
    {
      id: 'SL-2026-8924',
      buyerId: 'usr-buyer-2',
      buyerName: 'Claire Umutoni',
      buyerEmail: 'claire.umutoni@kigali.rw',
      buyerPhone: '+250 782 554 112',
      buyerAddress: 'KG 549 St, Gacuriro',
      buyerDistrict: 'Gasabo, Kigali',
      deliveryNotes: 'Call me when near MTN Centre.',
      items: [
        {
          shoeId: 'shoe-2',
          shoeName: 'Urban Classic Low',
          brand: 'Urban Core',
          image: '/src/assets/images/hero_editorial_sneakers_1791024851058.jpg',
          vendorId: 'vendor-1',
          vendorName: 'Urban Sole',
          size: 40,
          quantity: 1,
          price: 54000,
        },
        {
          shoeId: 'shoe-4',
          shoeName: 'Chelsea Essential Suede',
          brand: 'Atelier Heritage',
          image: '/src/assets/images/product_chelsea_boot_1791024888794.jpg',
          vendorId: 'vendor-2',
          vendorName: 'Kigali Footwear',
          size: 40,
          quantity: 1,
          price: 88000,
        },
      ],
      subtotal: 142000,
      deliveryFee: 2500,
      total: 144500,
      status: 'Pending',
      createdAt: '2026-10-03T02:15:00Z',
      updatedAt: '2026-10-03T02:15:00Z',
      vendorIds: ['vendor-1', 'vendor-2'],
    },
  ];

  return {
    users,
    vendors,
    shoes,
    carts: {
      'usr-buyer-1': [],
    },
    orders,
    favorites: {
      'usr-buyer-1': ['shoe-1', 'shoe-4'],
    },
    sessions: {},
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.readFromDisk();
  }

  private ensureDataDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading database file, reseeding:', err);
    }
    const seed = getInitialSeed();
    this.writeToDisk(seed);
    return seed;
  }

  private writeToDisk(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing database file:', err);
    }
  }

  public save() {
    this.writeToDisk(this.data);
  }

  // User queries
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Session queries
  public createSession(userId: string, role: UserRole): string {
    const token = generateToken();
    this.data.sessions[token] = {
      userId,
      role,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    this.save();
    return token;
  }

  public getSession(token: string): { userId: string; role: UserRole } | null {
    const session = this.data.sessions[token];
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      delete this.data.sessions[token];
      this.save();
      return null;
    }
    return { userId: session.userId, role: session.role };
  }

  public deleteSession(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  // Vendor queries
  public getVendors(): VendorRecord[] {
    return this.data.vendors;
  }

  public findVendorById(id: string): VendorRecord | undefined {
    return this.data.vendors.find((v) => v.id === id);
  }

  public createVendor(vendor: VendorRecord): VendorRecord {
    this.data.vendors.push(vendor);
    this.save();
    return vendor;
  }

  public updateVendor(id: string, updates: Partial<VendorRecord>): VendorRecord | undefined {
    const idx = this.data.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    this.data.vendors[idx] = { ...this.data.vendors[idx], ...updates };
    this.save();
    return this.data.vendors[idx];
  }

  // Shoe queries
  public getShoes(): ShoeRecord[] {
    return this.data.shoes;
  }

  public findShoeById(id: string): ShoeRecord | undefined {
    return this.data.shoes.find((s) => s.id === id);
  }

  public createShoe(shoe: ShoeRecord): ShoeRecord {
    this.data.shoes.unshift(shoe);
    this.save();
    return shoe;
  }

  public updateShoe(id: string, updates: Partial<ShoeRecord>): ShoeRecord | undefined {
    const idx = this.data.shoes.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.shoes[idx] = { ...this.data.shoes[idx], ...updates };
    this.save();
    return this.data.shoes[idx];
  }

  public deleteShoe(id: string): boolean {
    const lenBefore = this.data.shoes.length;
    this.data.shoes = this.data.shoes.filter((s) => s.id !== id);
    if (this.data.shoes.length !== lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  public updateShoeStock(shoeId: string, size: number, newStock: number): ShoeRecord | undefined {
    const shoe = this.findShoeById(shoeId);
    if (!shoe) return undefined;
    shoe.stock[size] = Math.max(0, newStock);
    shoe.sizes = Object.keys(shoe.stock)
      .map(Number)
      .filter((sz) => shoe.stock[sz] > 0);
    this.save();
    return shoe;
  }

  // Cart queries
  public getCart(userId: string): CartItemRecord[] {
    const items = this.data.carts[userId] || [];
    const populated: CartItemRecord[] = [];
    for (const item of items) {
      const shoe = this.findShoeById(item.shoeId);
      const vendor = shoe ? this.findVendorById(shoe.vendorId) : undefined;
      if (shoe && vendor) {
        populated.push({
          ...item,
          price: shoe.price,
          shoe,
          vendor,
        });
      }
    }
    return populated;
  }

  public addToCart(userId: string, shoeId: string, size: number, quantity: number): CartItemRecord[] {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }
    const cart = this.data.carts[userId];
    const shoe = this.findShoeById(shoeId);
    if (!shoe) throw new Error('Shoe not found');

    const availableStock = shoe.stock[size] || 0;
    if (availableStock <= 0) {
      throw new Error(`Size ${size} is currently out of stock`);
    }

    const existingIndex = cart.findIndex((i) => i.shoeId === shoeId && i.size === size);
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        throw new Error(`Cannot add more than available stock (${availableStock} pairs)`);
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (quantity > availableStock) {
        throw new Error(`Cannot add more than available stock (${availableStock} pairs)`);
      }
      cart.unshift({
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        shoeId,
        vendorId: shoe.vendorId,
        size,
        quantity,
        price: shoe.price,
      });
    }
    this.save();
    return this.getCart(userId);
  }

  public updateCartItem(userId: string, cartItemId: string, delta: number): CartItemRecord[] {
    const cart = this.data.carts[userId] || [];
    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return this.getCart(userId);

    const shoe = this.findShoeById(item.shoeId);
    if (!shoe) {
      this.data.carts[userId] = cart.filter((i) => i.id !== cartItemId);
      this.save();
      return this.getCart(userId);
    }

    const availableStock = shoe.stock[item.size] || 0;
    const nextQty = item.quantity + delta;

    if (nextQty <= 0) {
      this.data.carts[userId] = cart.filter((i) => i.id !== cartItemId);
    } else {
      if (nextQty > availableStock) {
        throw new Error(`Cannot order more than available stock (${availableStock} pairs)`);
      }
      item.quantity = nextQty;
    }
    this.save();
    return this.getCart(userId);
  }

  public removeCartItem(userId: string, cartItemId: string): CartItemRecord[] {
    if (!this.data.carts[userId]) return [];
    this.data.carts[userId] = this.data.carts[userId].filter((i) => i.id !== cartItemId);
    this.save();
    return this.getCart(userId);
  }

  public clearCart(userId: string) {
    this.data.carts[userId] = [];
    this.save();
  }

  // Order queries
  public getOrdersForBuyer(buyerId: string): OrderRecord[] {
    return this.data.orders.filter((o) => o.buyerId === buyerId);
  }

  public getOrdersForVendor(vendorId: string): OrderRecord[] {
    // Only return orders containing products from this vendor, and only return order items for this vendor
    return this.data.orders
      .filter((o) => o.vendorIds.includes(vendorId) || o.items.some((it) => it.vendorId === vendorId))
      .map((o) => {
        const vendorItems = o.items.filter((it) => it.vendorId === vendorId);
        const vendorSubtotal = vendorItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
        return {
          ...o,
          items: vendorItems,
          subtotal: vendorSubtotal,
          total: vendorSubtotal + o.deliveryFee,
        };
      });
  }

  public findOrderById(id: string): OrderRecord | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(payload: {
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    buyerDistrict: string;
    deliveryNotes?: string;
  }): OrderRecord {
    const cartItems = this.getCart(payload.buyerId);
    if (cartItems.length === 0) {
      throw new Error('Shopping bag is empty');
    }

    // 1. Inventory check
    for (const item of cartItems) {
      const shoe = this.findShoeById(item.shoeId);
      if (!shoe) {
        throw new Error(`Product ${item.shoe?.name || item.shoeId} is no longer available`);
      }
      const stock = shoe.stock[item.size] || 0;
      if (stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${shoe.name} in EU size ${item.size} (Only ${stock} remaining)`
        );
      }
    }

    // 2. Decrement inventory immediately
    for (const item of cartItems) {
      const shoe = this.findShoeById(item.shoeId)!;
      shoe.stock[item.size] = Math.max(0, shoe.stock[item.size] - item.quantity);
      shoe.sizes = Object.keys(shoe.stock)
        .map(Number)
        .filter((sz) => shoe.stock[sz] > 0);
    }

    // 3. Assemble order items & vendors
    const vendorIds = new Set<string>();
    const orderItems: OrderItemRecord[] = cartItems.map((ci) => {
      vendorIds.add(ci.vendorId);
      return {
        shoeId: ci.shoeId,
        shoeName: ci.shoe!.name,
        brand: ci.shoe!.brand,
        image: ci.shoe!.images[0],
        vendorId: ci.vendorId,
        vendorName: ci.vendor!.name,
        size: ci.size,
        quantity: ci.quantity,
        price: ci.price,
      };
    });

    const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = 2500;
    const total = subtotal + deliveryFee;

    const newOrder: OrderRecord = {
      id: `SL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerId: payload.buyerId,
      buyerName: payload.buyerName,
      buyerEmail: payload.buyerEmail,
      buyerPhone: payload.buyerPhone,
      buyerAddress: payload.buyerAddress,
      buyerDistrict: payload.buyerDistrict,
      deliveryNotes: payload.deliveryNotes,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendorIds: Array.from(vendorIds),
    };

    this.data.orders.unshift(newOrder);
    this.clearCart(payload.buyerId);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, rejectReason?: string): OrderRecord {
    const order = this.findOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'Rejected') {
      order.rejectReason = rejectReason || 'Vendor cannot fulfill this order at this time';
      // Restock items back if rejected
      if (prevStatus !== 'Rejected' && prevStatus !== 'Cancelled') {
        for (const item of order.items) {
          const shoe = this.findShoeById(item.shoeId);
          if (shoe) {
            shoe.stock[item.size] = (shoe.stock[item.size] || 0) + item.quantity;
            shoe.sizes = Object.keys(shoe.stock)
              .map(Number)
              .filter((sz) => shoe.stock[sz] > 0);
          }
        }
      }
    }

    this.save();
    return order;
  }

  // Favorites
  public getFavorites(userId: string): string[] {
    return this.data.favorites[userId] || [];
  }

  public toggleFavorite(userId: string, shoeId: string): string[] {
    if (!this.data.favorites[userId]) {
      this.data.favorites[userId] = [];
    }
    const favs = this.data.favorites[userId];
    const idx = favs.indexOf(shoeId);
    if (idx > -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(shoeId);
    }
    this.save();
    return favs;
  }
}

export const db = new Database();
