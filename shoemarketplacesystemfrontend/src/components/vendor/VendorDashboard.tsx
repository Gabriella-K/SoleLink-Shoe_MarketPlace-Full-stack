import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Layers,
  Store,
  BarChart3,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  Clock,
  Filter,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';
import { Shoe, ShoeCategory, ShoeCondition, OrderStatus, Order } from '../../types/marketplace';
import { uploadService } from '../../services/uploadService';

export const VendorDashboard: React.FC = () => {
  const {
    activeVendor,
    vendors,
    currentUser,
    userRole,
    openAuthModal,
    shoes,
    orders,
    vendorDashboardTab,
    setVendorDashboardTab,
    addShoe,
    updateShoe,
    deleteShoe,
    updateShoeStock,
    updateOrderStatus,
    updateVendorProfile,
    setActivePage,
    openShoeDetail,
    openVendorStore,
    logout,
  } = useMarketplace();

  // Guard: if not vendor, show role warning
  if (userRole !== 'vendor' || !activeVendor) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAFAF9]">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs max-w-md w-full text-center space-y-4">
          <Store className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="font-display text-xl font-bold text-stone-900">Vendor Portal Access</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Sign in to your vendor account, or register your shop, to list shoes and manage orders.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => openAuthModal({ role: 'vendor', type: 'login' })}
              className="py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
            >
              Sign In as Vendor
            </button>
            <button
              type="button"
              onClick={() => openAuthModal({ role: 'vendor', type: 'register' })}
              className="py-2.5 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Register Your Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter vendor's own shoes & orders
  const vendorShoes = shoes.filter((s) => s.vendorId === activeVendor.id);
  const vendorOrders = orders.filter((o) =>
    o.vendorIds?.includes(activeVendor.id) || o.items.some((i) => i.vendorId === activeVendor.id)
  );

  // Real statistics computed from live database
  const totalProducts = vendorShoes.length;
  const pendingOrders = vendorOrders.filter((o) => o.status === 'Pending').length;
  const activeOrders = vendorOrders.filter(
    (o) => o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready'
  ).length;
  const completedOrders = vendorOrders.filter((o) => o.status === 'Completed').length;
  const totalSales = vendorOrders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((sum, ord) => {
      const vendorItemsTotal = ord.items
        .filter((it) => it.vendorId === activeVendor.id)
        .reduce((acc, it) => acc + it.price * it.quantity, 0);
      return sum + vendorItemsTotal;
    }, 0);

  // Shoe Form State
  const [shoeForm, setShoeForm] = useState({
    name: '',
    brand: '',
    category: 'Sneakers' as ShoeCategory,
    price: 65000,
    originalPrice: 75000,
    condition: 'New' as ShoeCondition,
    sizes: [40, 41, 42, 43, 44],
    stock: { 40: 3, 41: 4, 42: 5, 43: 3, 44: 2 } as Record<number, number>,
    color: 'Chalk White / Charcoal',
    material: 'Full-grain calf leather upper, durable rubber sole',
    description: 'Minimalist craftsmanship, designed for long-lasting comfort and urban movement in Kigali.',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
  });

  const [editingShoeId, setEditingShoeId] = useState<string | null>(null);
  const [productsViewMode, setProductsViewMode] = useState<'table' | 'grid'>('table');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('All');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingShoe, setIsSubmittingShoe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reject order modal state
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Requested shoe size temporarily out of stock');
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);

  // Filtered shoes in My Products
  const filteredMyProducts = vendorShoes.filter((shoe) => {
    if (productSearch) {
      const q = productSearch.toLowerCase();
      if (!shoe.name.toLowerCase().includes(q) && !shoe.brand.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (productCatFilter !== 'All' && shoe.category !== productCatFilter) {
      return false;
    }
    return true;
  });

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(file);
      setShoeForm((prev) => ({
        ...prev,
        images: [res.url, ...prev.images.filter((img) => img !== res.url)],
      }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePublishShoe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoeForm.name.trim() || !shoeForm.brand.trim()) {
      alert('Please fill in Shoe Name and Brand.');
      return;
    }

    setIsSubmittingShoe(true);
    try {
      if (editingShoeId) {
        await updateShoe(editingShoeId, shoeForm);
        setEditingShoeId(null);
      } else {
        await addShoe({
          vendorId: activeVendor.id,
          name: shoeForm.name,
          slug: shoeForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand: shoeForm.brand,
          category: shoeForm.category,
          price: Number(shoeForm.price),
          originalPrice: shoeForm.originalPrice ? Number(shoeForm.originalPrice) : undefined,
          condition: shoeForm.condition,
          sizes: shoeForm.sizes,
          stock: shoeForm.stock,
          color: shoeForm.color,
          material: shoeForm.material,
          description: shoeForm.description,
          images: shoeForm.images,
        });
      }
      setVendorDashboardTab('products');
    } catch (err: any) {
      alert(err.message || 'Failed to publish shoe');
    } finally {
      setIsSubmittingShoe(false);
    }
  };

  const handleStartEdit = (shoe: Shoe) => {
    setEditingShoeId(shoe.id);
    setShoeForm({
      name: shoe.name,
      brand: shoe.brand,
      category: shoe.category,
      price: shoe.price,
      originalPrice: shoe.originalPrice || 0,
      condition: shoe.condition,
      sizes: shoe.sizes,
      stock: shoe.stock,
      color: shoe.color,
      material: shoe.material,
      description: shoe.description,
      images: shoe.images,
    });
    setVendorDashboardTab('add-shoe');
  };

  const handleRejectOrderConfirm = async () => {
    if (rejectingOrderId) {
      await updateOrderStatus(rejectingOrderId, 'Rejected', rejectReason);
      setRejectingOrderId(null);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package, count: totalProducts },
    { id: 'add-shoe', label: '+ Add Shoe', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: pendingOrders > 0 ? `${pendingOrders} new` : undefined },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'store-profile', label: 'Store Profile', icon: Store },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Vendor Sidebar */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={activeVendor.logo}
                  alt={activeVendor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                />
                <div className="overflow-hidden">
                  <h3 className="font-display font-bold text-sm text-stone-900 truncate">
                    {activeVendor.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate">{activeVendor.location}</p>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Managing Store
                </label>
                <div className="text-xs font-semibold text-stone-800 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200 truncate">
                  {activeVendor.name} ({activeVendor.district.split(',')[0]})
                </div>
              </div>
            </div>

            <nav className="space-y-1 text-xs font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = vendorDashboardTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'add-shoe' && !editingShoeId) {
                        setEditingShoeId(null);
                        setShoeForm({
                          name: '',
                          brand: '',
                          category: 'Sneakers',
                          price: 65000,
                          originalPrice: 75000,
                          condition: 'New',
                          sizes: [40, 41, 42, 43, 44],
                          stock: { 40: 3, 41: 4, 42: 5, 43: 3, 44: 2 },
                          color: 'Chalk White / Charcoal',
                          material: 'Full-grain calf leather upper',
                          description: 'Minimalist craftsmanship, designed for long-lasting comfort.',
                          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
                        });
                      }
                      setVendorDashboardTab(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.count.toString().includes('new')
                            ? 'bg-amber-100 text-amber-900 font-semibold'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-stone-100 space-y-1">
                <button
                  type="button"
                  onClick={() => openVendorStore(activeVendor.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                  <span>View Public Store</span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* TAB: OVERVIEW */}
            {vendorDashboardTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                        Good morning, {activeVendor.name}
                      </h1>
                      <p className="text-xs sm:text-sm text-stone-500 mt-1">
                        Here's what's happening with your store today in Kigali.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingShoeId(null);
                        setVendorDashboardTab('add-shoe');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Add New Shoe</span>
                    </button>
                  </div>

                  {/* 4 Statistics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100 text-xs">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Total Products</span>
                      <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                        {totalProducts}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Pending Orders</span>
                      <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
                        {pendingOrders}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Active Orders</span>
                      <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
                        {activeOrders}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Total Sales</span>
                      <span className="text-lg sm:text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {formatRWF(totalSales)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-stone-900">
                        Recent Store Orders
                      </h2>
                      <p className="text-[11px] text-stone-500">
                        Customer orders waiting for action or dispatch.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setVendorDashboardTab('orders')}
                      className="text-xs font-semibold text-stone-900 hover:underline"
                    >
                      Manage All Orders →
                    </button>
                  </div>

                  {vendorOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
                          <tr>
                            <th className="py-2.5 px-3">Order ID</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {vendorOrders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="py-3 px-3 font-mono font-semibold text-stone-900">
                                {ord.id}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-stone-900">{ord.buyerName}</div>
                                <div className="text-[10px] text-stone-400 font-mono">
                                  {ord.buyerPhone}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                {ord.items[0]?.shoeName} (EU {ord.items[0]?.size})
                              </td>
                              <td className="py-3 px-3 font-mono text-stone-500">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono font-semibold text-stone-900 tabular-nums">
                                {formatRWF(ord.total)}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-medium text-xs">{ord.status}</span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {ord.status === 'Pending' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => updateOrderStatus(ord.id, 'Accepted')}
                                        className="px-2.5 py-1 bg-stone-900 text-white rounded text-[11px] font-semibold hover:bg-stone-800"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRejectingOrderId(ord.id)}
                                        className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {ord.status !== 'Pending' && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderForAction(ord)}
                                      className="text-stone-900 hover:underline font-semibold"
                                    >
                                      Update
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-500">
                      No incoming orders received yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: MY PRODUCTS */}
            {vendorDashboardTab === 'products' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-xl font-bold text-stone-900">My Products</h1>
                    <p className="text-xs text-stone-500 mt-1">
                      Manage your shoe listings, prices, sizes, and stock availability.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingShoeId(null);
                      setVendorDashboardTab('add-shoe');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Add Shoe</span>
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search your listings..."
                        className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs w-48 sm:w-60 focus:outline-none focus:border-stone-900"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    </div>

                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                    >
                      <option value="All">All Categories</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Running">Running</option>
                      <option value="Formal">Formal</option>
                      <option value="Boots">Boots</option>
                      <option value="Sandals">Sandals</option>
                      <option value="Casual">Casual</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">View:</span>
                    <button
                      type="button"
                      onClick={() => setProductsViewMode('table')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        productsViewMode === 'table'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductsViewMode('grid')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        productsViewMode === 'grid'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>

                {filteredMyProducts.length > 0 ? (
                  productsViewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
                          <tr>
                            <th className="py-2.5 px-3">Image</th>
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3">Brand</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Sizes</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Condition</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredMyProducts.map((shoe) => {
                            const totalStock = Object.values(shoe.stock || {}).reduce(
                              (a, b) => a + b,
                              0
                            );

                            return (
                              <tr key={shoe.id} className="hover:bg-stone-50/60 transition-colors">
                                <td className="py-3 px-3">
                                  <img
                                    src={shoe.images[0]}
                                    alt={shoe.name}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                                  />
                                </td>
                                <td className="py-3 px-3 font-semibold text-stone-900">
                                  {shoe.name}
                                </td>
                                <td className="py-3 px-3 text-stone-600">{shoe.brand}</td>
                                <td className="py-3 px-3 text-stone-600">{shoe.category}</td>
                                <td className="py-3 px-3 font-mono text-[11px]">
                                  {shoe.sizes.join(', ')}
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-stone-900 tabular-nums">
                                  {formatRWF(shoe.price)}
                                </td>
                                <td className="py-3 px-3 text-stone-500">{shoe.condition}</td>
                                <td className="py-3 px-3">
                                  {totalStock > 0 ? (
                                    <span className="text-emerald-700 font-medium">
                                      Active ({totalStock} pairs)
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 font-medium">Sold Out</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(shoe)}
                                      title="Edit listing"
                                      className="p-1 text-stone-600 hover:text-stone-900"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openShoeDetail(shoe.id)}
                                      title="View public page"
                                      className="p-1 text-stone-600 hover:text-stone-900"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Delete listing "${shoe.name}"?`)) {
                                          deleteShoe(shoe.id);
                                        }
                                      }}
                                      title="Delete shoe"
                                      className="p-1 text-rose-500 hover:text-rose-700"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredMyProducts.map((shoe) => (
                        <div
                          key={shoe.id}
                          className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <img
                              src={shoe.images[0]}
                              alt={shoe.name}
                              referrerPolicy="no-referrer"
                              className="w-full aspect-[4/3] object-cover rounded-lg bg-stone-200"
                            />
                            <div className="text-[11px] uppercase font-bold text-stone-500">
                              {shoe.brand} · {shoe.category}
                            </div>
                            <div className="font-bold text-stone-900">{shoe.name}</div>
                            <div className="font-mono font-bold text-stone-900">
                              {formatRWF(shoe.price)}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(shoe)}
                              className="text-stone-800 font-semibold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openShoeDetail(shoe.id)}
                              className="text-stone-600 hover:underline"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete "${shoe.name}"?`)) deleteShoe(shoe.id);
                              }}
                              className="text-rose-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300 p-8 space-y-3">
                    <p className="text-stone-700 font-semibold text-sm">You haven't added any shoes yet.</p>
                    <p className="text-xs text-stone-500">Add your first footwear listing to begin receiving orders from Kigali buyers.</p>
                    <button
                      type="button"
                      onClick={() => setVendorDashboardTab('add-shoe')}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
                    >
                      Add Your First Shoe
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADD / EDIT SHOE */}
            {vendorDashboardTab === 'add-shoe' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    {editingShoeId ? 'Edit Shoe Listing' : 'Add New Shoe Listing'}
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Provide accurate footwear details, EU sizes, and materials for buyers.
                  </p>
                </div>

                <form onSubmit={handlePublishShoe} className="space-y-6 text-xs">
                  {/* Image Upload Block */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 block">Product Photography</span>
                      <span className="text-[11px] text-stone-500">Upload clean studio image (&lt;5MB)</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {shoeForm.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-300 group">
                          <img
                            src={img}
                            alt="Shoe"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {shoeForm.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setShoeForm((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-[10px]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      {/* File upload trigger */}
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-stone-300 hover:border-stone-900 flex flex-col items-center justify-center text-stone-500 hover:text-stone-900 transition-colors p-2 text-center"
                      >
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-semibold">
                          {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Shoe Model Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shoeForm.name}
                        onChange={(e) => setShoeForm({ ...shoeForm, name: e.target.value })}
                        placeholder="e.g. Stride Runner Pro"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Brand</label>
                      <input
                        type="text"
                        required
                        value={shoeForm.brand}
                        onChange={(e) => setShoeForm({ ...shoeForm, brand: e.target.value })}
                        placeholder="e.g. SoleLink Lab, Nike, Atelier Heritage"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Category</label>
                      <select
                        value={shoeForm.category}
                        onChange={(e) =>
                          setShoeForm({ ...shoeForm, category: e.target.value as ShoeCategory })
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      >
                        <option value="Sneakers">Sneakers</option>
                        <option value="Running">Running</option>
                        <option value="Formal">Formal</option>
                        <option value="Boots">Boots</option>
                        <option value="Sandals">Sandals</option>
                        <option value="Casual">Casual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Condition</label>
                      <select
                        value={shoeForm.condition}
                        onChange={(e) =>
                          setShoeForm({ ...shoeForm, condition: e.target.value as ShoeCondition })
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      >
                        <option value="New">Brand New</option>
                        <option value="Used - Like New">Used - Like New</option>
                        <option value="Used - Good">Used - Good</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Price (in RWF)
                      </label>
                      <input
                        type="number"
                        required
                        value={shoeForm.price}
                        onChange={(e) =>
                          setShoeForm({ ...shoeForm, price: parseInt(e.target.value, 10) })
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Original Price (Optional comparison)
                      </label>
                      <input
                        type="number"
                        value={shoeForm.originalPrice}
                        onChange={(e) =>
                          setShoeForm({
                            ...shoeForm,
                            originalPrice: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Color Scheme
                      </label>
                      <input
                        type="text"
                        value={shoeForm.color}
                        onChange={(e) => setShoeForm({ ...shoeForm, color: e.target.value })}
                        placeholder="e.g. Chalk White & Sand"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Material</label>
                      <input
                        type="text"
                        value={shoeForm.material}
                        onChange={(e) => setShoeForm({ ...shoeForm, material: e.target.value })}
                        placeholder="e.g. Italian calfskin, rubber cupsole"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Sizing & Stock Matrix */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">
                      Available EU Sizes & Stock per Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      {[38, 39, 40, 41, 42, 43, 44, 45].map((sz) => {
                        const currentQty = shoeForm.stock[sz] || 0;
                        return (
                          <div key={sz} className="p-2 bg-white rounded-lg border border-stone-200">
                            <span className="font-mono font-bold block text-stone-800">
                              EU {sz}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-stone-400">Qty:</span>
                              <input
                                type="number"
                                min="0"
                                value={currentQty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  const newStock = { ...shoeForm.stock, [sz]: val };
                                  const newSizes = Object.keys(newStock)
                                    .map(Number)
                                    .filter((k) => newStock[k] > 0);
                                  setShoeForm({
                                    ...shoeForm,
                                    stock: newStock,
                                    sizes: newSizes,
                                  });
                                }}
                                className="w-16 px-1.5 py-0.5 border border-stone-300 rounded text-xs font-mono"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Shoe Description & Fit Advice
                    </label>
                    <textarea
                      rows={3}
                      value={shoeForm.description}
                      onChange={(e) => setShoeForm({ ...shoeForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setVendorDashboardTab('products')}
                      className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingShoe}
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 disabled:bg-stone-400"
                    >
                      {isSubmittingShoe
                        ? 'Publishing...'
                        : editingShoeId
                        ? 'Update Shoe'
                        : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ORDERS */}
            {vendorDashboardTab === 'orders' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    Customer Orders Management
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Accept, dispatch, or reject incoming customer orders from Kigali shoppers.
                  </p>
                </div>

                <div className="space-y-4">
                  {vendorOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{ord.id}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-700 font-medium">{ord.buyerName}</span>
                          <span className="text-stone-400 font-mono text-[11px]">
                            ({ord.buyerPhone})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded text-xs">
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items belonging to this vendor */}
                      <div className="space-y-2 text-xs">
                        {ord.items
                          .filter((it) => it.vendorId === activeVendor.id)
                          .map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <img
                                  src={it.image}
                                  alt={it.shoeName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded object-cover border border-stone-200"
                                />
                                <div>
                                  <div className="font-semibold text-stone-900">{it.shoeName}</div>
                                  <div className="text-stone-500 text-[11px]">
                                    Size EU {it.size} · Quantity: {it.quantity}
                                  </div>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-stone-900 tabular-nums">
                                {formatRWF(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Status progression actions */}
                      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-stone-500">
                          Destination: <span className="text-stone-800 font-medium">{ord.buyerAddress}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(ord.id, 'Accepted')}
                                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                              >
                                Accept Order
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingOrderId(ord.id)}
                                className="px-3 py-1.5 border border-rose-300 text-rose-700 rounded-lg font-semibold hover:bg-rose-50"
                              >
                                Reject Order
                              </button>
                            </>
                          )}

                          {ord.status === 'Accepted' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                              className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                            >
                              Mark Preparing
                            </button>
                          )}

                          {ord.status === 'Preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Ready')}
                              className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                            >
                              Dispatch (Mark Ready)
                            </button>
                          )}

                          {ord.status === 'Ready' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Completed')}
                              className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800"
                            >
                              Mark Delivered (Completed)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {vendorOrders.length === 0 && (
                    <div className="text-center py-10 text-stone-500 text-xs">
                      No customer orders have been received yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {vendorDashboardTab === 'inventory' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    Inventory & Stock Levels
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Live stock counters per shoe size with subtle low-stock indicators.
                  </p>
                </div>

                <div className="space-y-4">
                  {vendorShoes.map((shoe) => {
                    const totalPairs = Object.values(shoe.stock || {}).reduce((a, b) => a + b, 0);

                    return (
                      <div
                        key={shoe.id}
                        className="p-4 rounded-xl border border-stone-200 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={shoe.images[0]}
                              alt={shoe.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                            />
                            <div>
                              <h3 className="font-bold text-stone-900">{shoe.name}</h3>
                              <p className="text-stone-500 text-[11px]">
                                {shoe.brand} · {shoe.category} · {formatRWF(shoe.price)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-stone-900">
                              {totalPairs} pairs in stock
                            </span>
                            {totalPairs <= 3 && totalPairs > 0 && (
                              <p className="text-[11px] text-amber-700 font-medium">
                                Low stock — {totalPairs} remaining
                              </p>
                            )}
                            {totalPairs === 0 && (
                              <p className="text-[11px] text-rose-600 font-medium">Out of stock</p>
                            )}
                          </div>
                        </div>

                        {/* Inline size stock editors that save to backend */}
                        <div className="pt-2 border-t border-stone-100 grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {shoe.sizes.map((sz) => {
                            const count = shoe.stock[sz] || 0;
                            return (
                              <div
                                key={sz}
                                className="flex items-center justify-between p-1.5 bg-stone-50 rounded border border-stone-200"
                              >
                                <span className="font-mono font-bold">EU {sz}</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={count}
                                  onChange={(e) =>
                                    updateShoeStock(shoe.id, sz, parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-12 px-1 py-0.5 text-center bg-white border border-stone-300 rounded font-mono text-xs"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: STORE PROFILE */}
            {vendorDashboardTab === 'store-profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    Store Profile & Location
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage how your store appears to customers on the marketplace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Store Name</label>
                    <input
                      type="text"
                      value={activeVendor.name}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Location Title</label>
                    <input
                      type="text"
                      value={activeVendor.location}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { location: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Phone Hotline</label>
                    <input
                      type="text"
                      value={activeVendor.phone}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { phone: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={activeVendor.email}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { email: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">Physical Address</label>
                    <input
                      type="text"
                      value={activeVendor.address}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { address: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">
                      Store Tagline / Bio
                    </label>
                    <textarea
                      rows={2}
                      value={activeVendor.about}
                      onChange={(e) =>
                        updateVendorProfile(activeVendor.id, { about: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => openVendorStore(activeVendor.id)}
                    className="text-stone-900 font-semibold text-xs hover:underline flex items-center gap-1"
                  >
                    <span>View Public Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Store profile updated in database')}
                    className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS & SETTINGS */}
            {(vendorDashboardTab === 'analytics' || vendorDashboardTab === 'settings') && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    Store Performance & Analytics
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Live sales volume, order fulfillment velocity, and customer retention.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Gross Sales Volume</span>
                    <span className="font-mono text-xl font-bold text-stone-900 block mt-1">
                      {formatRWF(totalSales)}
                    </span>
                    <span className="text-[10px] text-emerald-700 mt-1 block">
                      From {vendorOrders.length} processed orders
                    </span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Average Order Value</span>
                    <span className="font-mono text-xl font-bold text-stone-900 block mt-1">
                      {formatRWF(vendorOrders.length > 0 ? Math.round(totalSales / vendorOrders.length) : 0)}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1 block">Per vendor transaction</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">Fulfillment Rate</span>
                    <span className="font-mono text-xl font-bold text-stone-900 block mt-1">
                      {vendorOrders.length > 0 ? `${Math.round((completedOrders / vendorOrders.length) * 100)}%` : '100%'}
                    </span>
                    <span className="text-[10px] text-emerald-700 mt-1 block">Kigali verified vendor status</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Reject Order Modal with Required Reason */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-stone-900 text-sm">Reject Customer Order</h3>
            <p className="text-xs text-stone-600">
              Please state why this order cannot be fulfilled. The reason will be provided to the buyer and reserved inventory will be restored to your stock.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Reason for rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectOrderConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
              >
                Confirm Rejection & Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Status Modal */}
      {selectedOrderForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-display font-bold text-stone-900 text-sm">Update Order #{selectedOrderForAction.id}</h3>
            <p className="text-stone-500">
              Current Status:{' '}
              <strong className="text-stone-900">{selectedOrderForAction.status}</strong>
            </p>

            <div className="space-y-1.5">
              {(
                ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'] as OrderStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrderForAction.id, st);
                    setSelectedOrderForAction(null);
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-stone-100 flex items-center justify-between"
                >
                  <span className="font-medium">{st}</span>
                  {selectedOrderForAction.status === st && (
                    <span className="text-emerald-600 font-bold">✓ Current</span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrderForAction(null)}
              className="w-full py-2 bg-stone-100 text-stone-700 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
