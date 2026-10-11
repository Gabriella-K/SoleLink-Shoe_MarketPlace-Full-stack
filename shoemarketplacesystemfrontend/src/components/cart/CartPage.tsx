import React, { useState } from 'react';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    setActivePage,
    openShoeDetail,
  } = useMarketplace();

  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const deliveryFee = cart.length > 0 ? 2500 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleUpdate = async (itemId: string, delta: number) => {
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateCartQuantity(itemId, delta);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemove = async (itemId: string) => {
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await removeFromCart(itemId);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAFAF9] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200/90 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-stone-900">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Discover curated sneakers, dress shoes, and boots from authentic Kigali footwear vendors.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <span className="text-xs text-stone-500 font-mono tabular-nums">
            {cart.length} distinct footwear {cart.length === 1 ? 'item' : 'items'} in bag
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-8">
          Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs divide-y divide-stone-100">
            {cart.map((item) => {
              const shoe = item.shoe;
              const vendor = item.vendor;
              const maxStock = shoe?.stock?.[item.size] || 10;
              const isItemBusy = loadingItems[item.id];

              return (
                <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <div
                    onClick={() => openShoeDetail(item.shoeId)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer border border-stone-200"
                  >
                    <img
                      src={shoe?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                      alt={shoe?.name || 'Shoe'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                            {shoe?.brand || 'SoleLink'}
                          </span>
                          <h3
                            onClick={() => openShoeDetail(item.shoeId)}
                            className="font-display font-semibold text-stone-900 hover:text-stone-700 cursor-pointer text-sm"
                          >
                            {shoe?.name || 'Footwear'}
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Vendor: <span className="font-medium text-stone-700">{vendor?.name || 'Marketplace Store'}</span>
                          </p>
                        </div>

                        <span className="text-sm font-bold text-stone-900 font-mono tabular-nums">
                          {formatRWF(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-stone-600">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-800 font-mono font-medium">
                          EU Size: {item.size}
                        </span>
                        <span className="text-stone-400 font-mono tabular-nums">
                          {formatRWF(item.price)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper and Remove Action */}
                    <div className="mt-3 flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white text-xs">
                        <button
                          type="button"
                          disabled={isItemBusy}
                          onClick={() => handleUpdate(item.id, -1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-3 font-mono font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isItemBusy || item.quantity >= maxStock}
                          onClick={() => handleUpdate(item.id, 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={() => handleRemove(item.id)}
                        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-5 sticky top-24">
            <h2 className="font-display text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  {formatRWF(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Kigali Courier Dispatch</span>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  {formatRWF(deliveryFee)}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Standard delivery within 24 hours across Gasabo, Nyarugenge & Kicukiro.
              </p>

              <div className="pt-3 border-t border-stone-100 flex justify-between text-sm font-bold text-stone-900">
                <span>Total Amount Due</span>
                <span className="font-mono tabular-nums text-base">{formatRWF(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pay on Delivery or via Mobile Money upon inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Direct dispatch from verified vendor boutique</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
