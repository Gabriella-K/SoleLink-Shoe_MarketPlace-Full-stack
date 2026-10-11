import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Heart,
  ShoppingBag,
  Package,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle,
  Eye,
  Store,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';
import { OrderStatus, Order } from '../../types/marketplace';

export const BuyerDashboard: React.FC = () => {
  const {
    activeBuyer,
    currentUser,
    userRole,
    logout,
    switchDemoPersona,
    setActivePage,
    buyerDashboardTab,
    setBuyerDashboardTab,
    orders,
    favorites,
    cartCount,
    shoes,
    vendors,
    openShoeDetail,
  } = useMarketplace();

  // Selected order details modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Guard: if not buyer, show sign-in prompt
  if (userRole !== 'buyer' || !activeBuyer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAFAF9]">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs max-w-md w-full text-center space-y-4">
          <User className="w-10 h-10 text-stone-700 mx-auto" />
          <h2 className="font-display text-xl font-bold text-stone-900">Buyer Account Access</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Please sign in to your buyer profile to track live orders, view saved footwear, and manage delivery addresses.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => switchDemoPersona('buyer')}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
            >
              Sign In as Jean-Luc Munyaneza (Buyer Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter buyer's orders
  const buyerOrders = orders.filter((o) => o.buyerId === activeBuyer.id || o.buyerEmail === activeBuyer.email);
  const activeOrdersCount = buyerOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready'
  ).length;
  const completedOrdersCount = buyerOrders.filter((o) => o.status === 'Completed').length;

  const favoriteShoes = shoes.filter((s) => favorites.includes(s.id));
  const recommendedShoes = shoes.slice(0, 4);

  // Status renderer without pills
  const renderStatus = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Vendor Accepted
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Preparing Dispatch
          </span>
        );
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Out for Delivery
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Delivered
          </span>
        );
      case 'Cancelled':
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Shoes', icon: Compass, action: () => setActivePage('shop') },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, count: cartCount, action: () => setActivePage('cart') },
    { id: 'orders', label: 'Orders', icon: Package, count: buyerOrders.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
            {/* Buyer Profile Preview */}
            <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
              <img
                src={activeBuyer.avatar}
                alt={activeBuyer.fullName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-stone-200"
              />
              <div className="overflow-hidden">
                <h3 className="font-semibold text-stone-900 text-sm truncate font-display">
                  {activeBuyer.fullName}
                </h3>
                <p className="text-[11px] text-stone-400 truncate font-mono">
                  {activeBuyer.email}
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1 text-xs font-medium">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = buyerDashboardTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setBuyerDashboardTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="lg:col-span-9 space-y-8">
            {/* TAB: OVERVIEW */}
            {buyerDashboardTab === 'overview' && (
              <div className="space-y-8">
                {/* Greeting Header */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-xs">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    Good morning, {activeBuyer.fullName.split(' ')[0]}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Discover something new for your next step.
                  </p>

                  {/* 4 Statistics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100 text-xs">
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Active Orders</span>
                      <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                        {activeOrdersCount}
                      </span>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Completed Orders</span>
                      <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                        {completedOrdersCount}
                      </span>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Saved Shoes</span>
                      <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                        {favorites.length}
                      </span>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                      <span className="text-stone-500 block text-[11px]">Cart Items</span>
                      <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                        {cartCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-stone-900">
                        Recent Orders
                      </h2>
                      <p className="text-[11px] text-stone-500">
                        Live order status directly from Kigali vendors.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBuyerDashboardTab('orders')}
                      className="text-xs font-semibold text-stone-900 hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  {buyerOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
                          <tr>
                            <th className="py-2.5 px-3">Order Number</th>
                            <th className="py-2.5 px-3">Product</th>
                            <th className="py-2.5 px-3">Vendor</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Total</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {buyerOrders.slice(0, 4).map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="py-3 px-3 font-mono font-semibold text-stone-900">
                                {ord.id}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  {ord.items[0]?.image && (
                                    <img
                                      src={ord.items[0].image}
                                      alt={ord.items[0].shoeName}
                                      referrerPolicy="no-referrer"
                                      className="w-8 h-8 rounded object-cover border border-stone-200"
                                    />
                                  )}
                                  <span className="font-medium text-stone-900 truncate max-w-[140px]">
                                    {ord.items[0]?.shoeName}
                                    {ord.items.length > 1 ? ` +${ord.items.length - 1}` : ''}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-stone-600">
                                {ord.items[0]?.vendorName || 'SoleLink Vendor'}
                              </td>
                              <td className="py-3 px-3 font-mono text-stone-500">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono font-semibold text-stone-900 tabular-nums">
                                {formatRWF(ord.total)}
                              </td>
                              <td className="py-3 px-3">{renderStatus(ord.status)}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="text-stone-900 hover:text-stone-600 font-semibold"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-500 space-y-2">
                      <p>You haven't placed any orders yet.</p>
                      <button
                        type="button"
                        onClick={() => setActivePage('shop')}
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>

                {/* Recommended For You */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-stone-900">
                        Recommended For You
                      </h2>
                      <p className="text-[11px] text-stone-500">
                        Based on your style preferences and Kigali favorites.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePage('shop')}
                      className="text-xs font-semibold text-stone-900 hover:underline"
                    >
                      Browse More →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendedShoes.map((shoe) => (
                      <ProductCard key={shoe.id} shoe={shoe} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {buyerDashboardTab === 'orders' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">My Orders</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Track real-time status and delivery for all your pairs across vendors.
                  </p>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 text-xs">
                  {[
                    'All',
                    'Pending',
                    'Accepted',
                    'Preparing',
                    'Ready',
                    'Completed',
                    'Cancelled',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {buyerOrders
                    .filter((o) => (orderStatusFilter === 'All' ? true : o.status === orderStatusFilter))
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-stone-900">{ord.id}</span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-500 font-mono">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>{renderStatus(ord.status)}</div>
                        </div>

                        {/* Items in this order */}
                        <div className="space-y-3">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={it.image}
                                  alt={it.shoeName}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200"
                                />
                                <div>
                                  <div className="font-semibold text-stone-900">{it.shoeName}</div>
                                  <div className="text-[11px] text-stone-500">
                                    EU Size {it.size} · Vendor: {it.vendorName} · Qty {it.quantity}
                                  </div>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-stone-900 tabular-nums">
                                {formatRWF(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="text-stone-500">
                            Deliver to: <span className="text-stone-800 font-medium">{ord.buyerAddress}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-sm font-bold text-stone-900 font-mono tabular-nums">
                              Total: {formatRWF(ord.total)}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-800 font-semibold hover:bg-stone-50 text-xs"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {buyerOrders.filter((o) =>
                    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
                  ).length === 0 && (
                    <div className="text-center py-12 text-stone-400 text-xs">
                      No orders match the selected filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: FAVORITES */}
            {buyerDashboardTab === 'favorites' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">Saved Shoes</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Pairs you've bookmarked for later consideration.
                  </p>
                </div>

                {favoriteShoes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {favoriteShoes.map((shoe) => (
                      <ProductCard key={shoe.id} shoe={shoe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-500 text-xs space-y-3">
                    <p>You have not saved any shoes yet.</p>
                    <button
                      type="button"
                      onClick={() => setActivePage('shop')}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MESSAGES */}
            {buyerDashboardTab === 'messages' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">Vendor Messages</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Direct communications with Kigali shoe merchants regarding sizing and deliveries.
                  </p>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  <div className="py-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900">Urban Sole (Kigali Heights)</span>
                      <span className="text-[11px] text-stone-400 font-mono">Yesterday</span>
                    </div>
                    <p className="text-stone-600">
                      "Good afternoon Jean-Luc, we have verified and packed your Stride Runner in EU 42. Our courier will head to Kacyiru at 2:00 PM."
                    </p>
                  </div>

                  <div className="py-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900">Kigali Footwear (Nyarugenge)</span>
                      <span className="text-[11px] text-stone-400 font-mono">Sep 24, 2026</span>
                    </div>
                    <p className="text-stone-600">
                      "Thank you for confirming receipt of the Thrivo Oxford Derby. Reach out if you need cedar shoe trees or leather cream!"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE & SETTINGS */}
            {(buyerDashboardTab === 'profile' || buyerDashboardTab === 'settings') && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-stone-900">
                    Buyer Profile & Address
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage your default delivery destination and contact info.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={activeBuyer.fullName}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      readOnly
                      defaultValue={activeBuyer.email}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      defaultValue={activeBuyer.phone}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Kigali District
                    </label>
                    <input
                      type="text"
                      defaultValue={activeBuyer.district}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">
                      Default Delivery Address
                    </label>
                    <input
                      type="text"
                      defaultValue={activeBuyer.address}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert('Profile changes saved')}
                    className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="font-mono text-xs text-stone-500">Order Reference</span>
                <h3 className="font-display font-bold text-lg font-mono text-stone-900">
                  {selectedOrderDetails.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Order Placed</span>
                <span className="font-mono text-stone-800">
                  {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span>{renderStatus(selectedOrderDetails.status)}</span>
              </div>
              {selectedOrderDetails.rejectReason && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                  <strong>Vendor Notice:</strong> {selectedOrderDetails.rejectReason}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Recipient</span>
                <span className="font-semibold text-stone-900">
                  {selectedOrderDetails.buyerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Address</span>
                <span className="text-stone-800">{selectedOrderDetails.buyerAddress}</span>
              </div>
              {selectedOrderDetails.deliveryNotes && (
                <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600 italic">
                  "{selectedOrderDetails.deliveryNotes}"
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 space-y-2">
                <span className="font-bold text-stone-900 block">Items:</span>
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>
                      {it.shoeName} (EU {it.size}) × {it.quantity}
                    </span>
                    <span className="font-mono font-bold">{formatRWF(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Amount Due</span>
                <span className="font-mono tabular-nums">
                  {formatRWF(selectedOrderDetails.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
