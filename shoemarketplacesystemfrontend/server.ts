import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  db,
  hashPassword,
  User,
  VendorRecord,
  ShoeRecord,
  ShoeCategory,
  ShoeCondition,
  OrderStatus,
} from './server/db.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionRole?: 'buyer' | 'vendor';
    }
  }
}

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth token middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = db.getSession(token);
    if (session) {
      const user = db.findUserById(session.userId);
      if (user) {
        req.user = user;
        req.sessionRole = session.role;
      }
    }
  }
  next();
});

// Guard helpers
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireVendor(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'vendor' || !req.user.vendorId) {
    return res.status(403).json({ error: 'Vendor account privileges required for this action.' });
  }
  next();
}

function requireBuyer(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Buyer account privileges required for this action.' });
  }
  next();
}

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// REST API ROUTES (/api/*)
// ==========================================

// 1. AUTH ROUTES
app.post('/api/auth/register-buyer', (req: Request, res: Response) => {
  const { fullName, email, phone, password, confirmPassword, district, address } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // Basic email pattern
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email address is already registered.' });
  }

  const newUser: User = {
    id: `usr-b-${Date.now()}`,
    role: 'buyer',
    email,
    passwordHash: hashPassword(password),
    fullName,
    phone,
    district: district || 'Gasabo, Kigali',
    address: address || 'Kigali, Rwanda',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = db.createSession(newUser.id, 'buyer');

  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json({
    user: safeUser,
    token,
    role: 'buyer',
    message: 'Buyer account created successfully',
  });
});

app.post('/api/auth/register-vendor', (req: Request, res: Response) => {
  const {
    ownerName,
    shopName,
    email,
    phone,
    location,
    password,
    confirmPassword,
    about,
    address,
  } = req.body;

  if (!ownerName || !shopName || !email || !phone || !location || !password) {
    return res.status(400).json({ error: 'Please fill in all required vendor registration fields.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email address is already registered.' });
  }

  const vendorId = `vend-${Date.now()}`;
  const newVendor: VendorRecord = {
    id: vendorId,
    name: shopName,
    slug: shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    ownerName,
    email,
    phone,
    location,
    district: location.includes(',') ? location.split(',')[1].trim() : 'Gasabo, Kigali',
    address: address || `${location}, Kigali`,
    openingHours: 'Mon – Sat: 9:00 AM – 8:00 PM',
    rating: 5.0,
    reviewCount: 1,
    verified: true,
    about: about || `${shopName} is an independent footwear vendor based in ${location}.`,
    tagline: 'Authentic local footwear boutique',
    joinedYear: 2026,
    logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(shopName)}`,
    coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  };

  db.createVendor(newVendor);

  const newUser: User = {
    id: `usr-v-${Date.now()}`,
    role: 'vendor',
    email,
    passwordHash: hashPassword(password),
    fullName: ownerName,
    phone,
    district: newVendor.district,
    address: newVendor.address,
    vendorId: newVendor.id,
    avatar: newVendor.logo,
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = db.createSession(newUser.id, 'vendor');

  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json({
    user: safeUser,
    vendor: newVendor,
    token,
    role: 'vendor',
    message: 'Vendor store registered successfully',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address.' });
  }

  const hash = hashPassword(password);
  if (user.passwordHash !== hash) {
    return res.status(401).json({ error: 'Incorrect password entered.' });
  }

  const token = db.createSession(user.id, user.role);
  const { passwordHash, ...safeUser } = user;

  let vendor = undefined;
  if (user.role === 'vendor' && user.vendorId) {
    vendor = db.findVendorById(user.vendorId);
  }

  return res.json({
    user: safeUser,
    vendor,
    token,
    role: user.role,
    message: `Welcome back, ${user.fullName}`,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { passwordHash, ...safeUser } = req.user;
  let vendor = undefined;
  if (req.user.role === 'vendor' && req.user.vendorId) {
    vendor = db.findVendorById(req.user.vendorId);
  }
  return res.json({
    user: safeUser,
    vendor,
    role: req.user.role,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    db.deleteSession(authHeader.substring(7));
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 2. SHOES / PRODUCTS ROUTES
app.get('/api/shoes', (req: Request, res: Response) => {
  const {
    search,
    category,
    brand,
    size,
    minPrice,
    maxPrice,
    condition,
    vendorId,
    sortBy,
  } = req.query;

  let shoes = db.getShoes();
  const vendors = db.getVendors();

  // Search filter
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    shoes = shoes.filter((shoe) => {
      const matchName = shoe.name.toLowerCase().includes(q);
      const matchBrand = shoe.brand.toLowerCase().includes(q);
      const matchCat = shoe.category.toLowerCase().includes(q);
      const matchDesc = shoe.description.toLowerCase().includes(q);
      const matchColor = shoe.color.toLowerCase().includes(q);
      const vendor = vendors.find((v) => v.id === shoe.vendorId);
      const matchVendor = vendor ? vendor.name.toLowerCase().includes(q) : false;
      return matchName || matchBrand || matchCat || matchDesc || matchColor || matchVendor;
    });
  }

  // Category filter
  if (category && category !== 'All') {
    shoes = shoes.filter((s) => s.category === category);
  }

  // Brand filter
  if (brand && brand !== 'All') {
    shoes = shoes.filter((s) => s.brand === brand);
  }

  // Size filter
  if (size && size !== 'All') {
    const sNum = parseInt(size as string, 10);
    shoes = shoes.filter((s) => s.sizes.includes(sNum) && (s.stock[sNum] || 0) > 0);
  }

  // Condition filter
  if (condition && condition !== 'All') {
    if (condition === 'New') {
      shoes = shoes.filter((s) => s.condition === 'New');
    } else if ((condition as string).startsWith('Used')) {
      shoes = shoes.filter((s) => s.condition.startsWith('Used'));
    }
  }

  // Vendor filter
  if (vendorId && vendorId !== 'All') {
    shoes = shoes.filter((s) => s.vendorId === vendorId);
  }

  // Price filter
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) shoes = shoes.filter((s) => s.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) shoes = shoes.filter((s) => s.price <= max);
  }

  // Sorting
  if (sortBy === 'price-asc') {
    shoes.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    shoes.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    shoes.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    shoes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({
    total: shoes.length,
    shoes,
  });
});

app.get('/api/shoes/:id', (req: Request, res: Response) => {
  const shoe = db.findShoeById(req.params.id);
  if (!shoe) {
    return res.status(404).json({ error: 'Shoe not found' });
  }
  const vendor = db.findVendorById(shoe.vendorId);
  return res.json({ shoe, vendor });
});

app.post('/api/shoes', requireVendor, (req: Request, res: Response) => {
  const {
    name,
    brand,
    category,
    price,
    originalPrice,
    condition,
    sizes,
    stock,
    color,
    material,
    description,
    images,
  } = req.body;

  if (!name || !brand || !category || !price) {
    return res.status(400).json({ error: 'Please provide shoe name, brand, category, and price.' });
  }

  const vendorId = req.user!.vendorId!;
  const newShoe: ShoeRecord = {
    id: `shoe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    vendorId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand,
    category: category as ShoeCategory,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    condition: (condition || 'New') as ShoeCondition,
    sizes: Array.isArray(sizes) ? sizes : [40, 41, 42, 43],
    stock: stock || { 40: 2, 41: 2, 42: 2, 43: 2 },
    color: color || 'Classic',
    material: material || 'Leather',
    description: description || '',
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  const created = db.createShoe(newShoe);
  return res.status(201).json({ shoe: created, message: 'Shoe listing published successfully' });
});

app.put('/api/shoes/:id', requireVendor, (req: Request, res: Response) => {
  const shoe = db.findShoeById(req.params.id);
  if (!shoe) {
    return res.status(404).json({ error: 'Shoe not found' });
  }

  // Enforce ownership: vendor can only update their own shoes!
  if (shoe.vendorId !== req.user!.vendorId) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this shoe listing.' });
  }

  const updated = db.updateShoe(req.params.id, req.body);
  return res.json({ shoe: updated, message: 'Shoe details updated successfully' });
});

app.delete('/api/shoes/:id', requireVendor, (req: Request, res: Response) => {
  const shoe = db.findShoeById(req.params.id);
  if (!shoe) {
    return res.status(404).json({ error: 'Shoe not found' });
  }

  // Enforce ownership
  if (shoe.vendorId !== req.user!.vendorId) {
    return res.status(403).json({ error: 'Unauthorized: You cannot delete another vendor’s product.' });
  }

  db.deleteShoe(req.params.id);
  return res.json({ success: true, message: 'Shoe listing removed' });
});

app.patch('/api/shoes/:id/stock', requireVendor, (req: Request, res: Response) => {
  const shoe = db.findShoeById(req.params.id);
  if (!shoe) {
    return res.status(404).json({ error: 'Shoe not found' });
  }

  if (shoe.vendorId !== req.user!.vendorId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { size, newStock } = req.body;
  if (size === undefined || newStock === undefined) {
    return res.status(400).json({ error: 'size and newStock are required' });
  }

  const updated = db.updateShoeStock(req.params.id, Number(size), Number(newStock));
  return res.json({ shoe: updated, message: `Stock updated for size ${size}` });
});

// 3. VENDORS ROUTES
app.get('/api/vendors', (req: Request, res: Response) => {
  const vendors = db.getVendors();
  const shoes = db.getShoes();
  const enhanced = vendors.map((v) => ({
    ...v,
    activeProductsCount: shoes.filter((s) => s.vendorId === v.id).length,
  }));
  return res.json({ vendors: enhanced });
});

app.get('/api/vendors/:id', (req: Request, res: Response) => {
  const vendor = db.findVendorById(req.params.id);
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor store not found' });
  }
  const vendorShoes = db.getShoes().filter((s) => s.vendorId === vendor.id);
  return res.json({ vendor, shoes: vendorShoes });
});

app.put('/api/vendors/:id', requireVendor, (req: Request, res: Response) => {
  if (req.user!.vendorId !== req.params.id) {
    return res.status(403).json({ error: 'Unauthorized: You can only edit your own store profile.' });
  }
  const updated = db.updateVendor(req.params.id, req.body);
  return res.json({ vendor: updated, message: 'Store profile updated successfully' });
});

// 4. CART ROUTES
app.get('/api/cart', requireAuth, (req: Request, res: Response) => {
  const cart = db.getCart(req.user!.id);
  return res.json({ cart });
});

app.post('/api/cart', requireAuth, (req: Request, res: Response) => {
  const { shoeId, size, quantity } = req.body;
  if (!shoeId || !size) {
    return res.status(400).json({ error: 'shoeId and size are required' });
  }
  try {
    const updatedCart = db.addToCart(req.user!.id, shoeId, Number(size), Number(quantity) || 1);
    return res.json({ cart: updatedCart, message: 'Added to cart' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/cart/:itemId', requireAuth, (req: Request, res: Response) => {
  const { delta } = req.body;
  try {
    const updatedCart = db.updateCartItem(req.user!.id, req.params.itemId, Number(delta) || 1);
    return res.json({ cart: updatedCart });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cart/:itemId', requireAuth, (req: Request, res: Response) => {
  const updatedCart = db.removeCartItem(req.user!.id, req.params.itemId);
  return res.json({ cart: updatedCart, message: 'Item removed from bag' });
});

app.delete('/api/cart', requireAuth, (req: Request, res: Response) => {
  db.clearCart(req.user!.id);
  return res.json({ cart: [], message: 'Cart cleared' });
});

// 5. ORDERS ROUTES
app.get('/api/orders', requireAuth, (req: Request, res: Response) => {
  if (req.user!.role === 'buyer') {
    const orders = db.getOrdersForBuyer(req.user!.id);
    return res.json({ orders });
  } else if (req.user!.role === 'vendor' && req.user!.vendorId) {
    // Only return vendor's specific items and orders
    const orders = db.getOrdersForVendor(req.user!.vendorId);
    return res.json({ orders });
  }
  return res.json({ orders: [] });
});

app.get('/api/orders/:id', requireAuth, (req: Request, res: Response) => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Security check: must be the buyer or one of the vendors
  if (req.user!.role === 'buyer' && order.buyerId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized to view this order' });
  }
  if (req.user!.role === 'vendor' && !order.vendorIds.includes(req.user!.vendorId || '')) {
    return res.status(403).json({ error: 'Unauthorized to view this order' });
  }

  // If vendor, strip other vendor items
  if (req.user!.role === 'vendor') {
    const vendorItems = order.items.filter((it) => it.vendorId === req.user!.vendorId);
    return res.json({
      order: {
        ...order,
        items: vendorItems,
      },
    });
  }

  return res.json({ order });
});

app.post('/api/orders', requireBuyer, (req: Request, res: Response) => {
  const { customerName, phone, district, address, notes } = req.body;

  if (!customerName || !phone || !address) {
    return res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
  }

  try {
    const newOrder = db.createOrder({
      buyerId: req.user!.id,
      buyerName: customerName,
      buyerEmail: req.user!.email,
      buyerPhone: phone,
      buyerAddress: address,
      buyerDistrict: district || req.user!.district || 'Gasabo, Kigali',
      deliveryNotes: notes,
    });
    return res.status(201).json({
      order: newOrder,
      message: `Order #${newOrder.id} successfully placed!`,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', requireVendor, (req: Request, res: Response) => {
  const { status, rejectReason } = req.body;
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Ensure this vendor owns at least one item in the order
  if (!order.vendorIds.includes(req.user!.vendorId!)) {
    return res.status(403).json({ error: 'Unauthorized: Order does not contain your items.' });
  }

  if (status === 'Rejected' && !rejectReason) {
    return res.status(400).json({ error: 'A reason is required when rejecting an order.' });
  }

  try {
    const updated = db.updateOrderStatus(req.params.id, status as OrderStatus, rejectReason);
    return res.json({ order: updated, message: `Order #${order.id} status updated to ${status}` });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 6. FAVORITES ROUTES
app.get('/api/favorites', requireAuth, (req: Request, res: Response) => {
  const favorites = db.getFavorites(req.user!.id);
  return res.json({ favorites });
});

app.post('/api/favorites/toggle', requireAuth, (req: Request, res: Response) => {
  const { shoeId } = req.body;
  if (!shoeId) return res.status(400).json({ error: 'shoeId required' });
  const updated = db.toggleFavorite(req.user!.id, shoeId);
  return res.json({ favorites: updated });
});

// 7. REAL IMAGE UPLOAD HANDLER
app.post('/api/upload', requireVendor, (req: Request, res: Response) => {
  const { imageBase64, filename } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  try {
    // Expecting data:image/png;base64,... or raw base64
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum 5MB size limit.' });
    }

    const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    return res.json({
      url: publicUrl,
      message: 'Product image uploaded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process image upload: ' + err.message });
  }
});

// 8. VENDOR ANALYTICS
app.get('/api/vendor/analytics', requireVendor, (req: Request, res: Response) => {
  const vendorId = req.user!.vendorId!;
  const shoes = db.getShoes().filter((s) => s.vendorId === vendorId);
  const orders = db.getOrdersForVendor(vendorId);

  const completed = orders.filter((o) => o.status === 'Completed').length;
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const active = orders.filter((o) => ['Accepted', 'Preparing', 'Ready'].includes(o.status)).length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((sum, o) => {
      const vendorItemsSum = o.items
        .filter((it) => it.vendorId === vendorId)
        .reduce((a, b) => a + b.price * b.quantity, 0);
      return sum + vendorItemsSum;
    }, 0);

  return res.json({
    totalProducts: shoes.length,
    pendingOrders: pending,
    activeOrders: active,
    completedOrders: completed,
    totalSales: totalRevenue,
    fulfillmentRate: orders.length > 0 ? Math.round((completed / orders.length) * 100) : 100,
  });
});

// ==========================================
// VITE / STATIC CLIENT MOUNTING
// ==========================================
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoleLink Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
