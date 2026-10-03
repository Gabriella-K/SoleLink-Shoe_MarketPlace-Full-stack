import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  Truck,
  RotateCcw,
  CheckCircle,
  MessageSquare,
  ShoppingBag,
  Heart,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedShoeId,
    shoes,
    vendors,
    addToCart,
    toggleFavorite,
    isFavorite,
    setActivePage,
    openVendorStore,
    setContactVendorShoe,
    isLoading,
  } = useMarketplace();

  const shoe = shoes.find((s) => s.id === selectedShoeId) || shoes[0];
  const vendor = vendors.find((v) => v.id === shoe?.vendorId) || vendors[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number>(() => {
    if (!shoe) return 42;
    // Pick first size that has stock > 0
    const inStock = shoe.sizes.find((sz) => (shoe.stock[sz] || 0) > 0);
    return inStock || shoe.sizes[0] || 42;
  });
  const [quantity, setQuantity] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading && !shoe) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8 bg-[#FAFAF9]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Loading shoe details...</p>
        </div>
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50">
        <div className="text-center space-y-3">
          <p className="text-stone-700 text-sm font-semibold">Footwear listing not found</p>
          <button
            onClick={() => setActivePage('shop')}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const currentStockForSize = shoe.stock[selectedSize] ?? 0;
  const isOutOfStock = currentStockForSize === 0;
  const favorited = isFavorite(shoe.id);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    setActionError(null);
    try {
      await addToCart(shoe.id, selectedSize, quantity);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    setActionError(null);
    try {
      await addToCart(shoe.id, selectedSize, quantity);
      setActivePage('checkout');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Similar shoes
  const similarShoes = shoes
    .filter((s) => s.id !== shoe.id && (s.category === shoe.category || s.vendorId === shoe.vendorId))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to footwear catalog</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Marketplace</span>
            <span aria-hidden="true">·</span>
            <span>{shoe.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-900 font-semibold truncate max-w-[150px]">{shoe.name}</span>
          </div>
        </div>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-stone-200/90 shadow-xs mb-14">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={shoe.images[activeImageIndex] || shoe.images[0]}
                alt={shoe.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded">
                {shoe.condition}
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite(shoe.id)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 shadow-xs hover:bg-white hover:text-red-500 transition-all"
                aria-label="Add to favorites"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorited ? 'fill-red-500 text-red-500' : 'text-stone-700'
                  }`}
                />
              </button>
            </div>

            {shoe.images.length > 1 && (
              <div className="flex items-center gap-3">
                {shoe.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-stone-900 shadow-xs'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${shoe.name} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Kigali 24h Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Vendor Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Fitting Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right: Purchase Module */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-stone-700">
                  {shoe.brand}
                </span>
                {vendor && (
                  <button
                    type="button"
                    onClick={() => openVendorStore(vendor.id)}
                    className="hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
                  >
                    <Store className="w-3.5 h-3.5 text-stone-500" />
                    <span>{vendor.name}</span>
                  </button>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {shoe.name}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="ml-1 font-bold text-stone-900 font-mono tabular-nums">
                    {shoe.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500">{shoe.reviewCount} customer reviews</span>
                <span className="text-stone-300">·</span>
                <span className="text-emerald-700 font-medium">In Stock</span>
              </div>

              {/* Price */}
              <div className="mt-4 pb-4 border-b border-stone-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tabular-nums">
                  {formatRWF(shoe.price)}
                </span>
                {shoe.originalPrice && (
                  <span className="text-sm text-stone-400 line-through font-mono tabular-nums">
                    {formatRWF(shoe.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="py-4 border-b border-stone-100 space-y-2">
                <p className="text-xs text-stone-600 leading-relaxed">{shoe.description}</p>
                <div className="text-[11px] text-stone-500 space-y-1 pt-1">
                  <div>
                    <strong className="text-stone-700">Color:</strong> {shoe.color}
                  </div>
                  <div>
                    <strong className="text-stone-700">Material:</strong> {shoe.material}
                  </div>
                </div>
              </div>

              {/* Size Selector with Real Inventory Enforcement */}
              <div className="py-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">Select EU Size</span>
                  <span className="font-mono text-[11px]">
                    {currentStockForSize > 0 ? (
                      currentStockForSize <= 2 ? (
                        <span className="text-amber-700 font-medium">
                          Low stock — only {currentStockForSize} pairs available
                        </span>
                      ) : (
                        <span className="text-stone-600">{currentStockForSize} pairs in stock</span>
                      )
                    ) : (
                      <span className="text-rose-600 font-semibold">Size Out of stock</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {shoe.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    const stock = shoe.stock[s] ?? 0;
                    const disabled = stock === 0;

                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedSize(s);
                          setQuantity(1);
                        }}
                        className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                            : disabled
                            ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed line-through'
                            : 'bg-white text-stone-800 border-stone-300 hover:border-stone-900'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity stepper capped at real stock */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white text-xs">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-stone-100 text-stone-600 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 font-mono font-semibold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= currentStockForSize || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(currentStockForSize, q + 1))}
                    className="px-3 py-1.5 hover:bg-stone-100 text-stone-600 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock || isAdding}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock || isAdding}
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-stone-100 text-stone-900 border border-stone-300 text-xs font-semibold hover:bg-stone-200 disabled:opacity-50 transition-colors"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setContactVendorShoe(shoe)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                <span>Contact Vendor for Sizing Advice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vendor Profile Section */}
        {vendor && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-xs mb-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-stone-900">{vendor.name}</h3>
                    {vendor.verified && (
                      <span className="flex items-center text-xs text-emerald-600 gap-1 font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified Store</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{vendor.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">★ {vendor.rating}</span>
                    <span aria-hidden="true">·</span>
                    <span>{vendor.reviewCount} customer reviews</span>
                  </div>
                  <p className="text-xs text-stone-600 max-w-xl pt-1">{vendor.about}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openVendorStore(vendor.id)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors whitespace-nowrap"
              >
                View Full Store Catalog
              </button>
            </div>
          </div>
        )}

        {/* Similar Shoes */}
        {similarShoes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Similar Footwear You Might Like
              </h2>
              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="text-xs font-semibold text-stone-900 hover:underline"
              >
                View Catalog →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarShoes.map((simShoe) => (
                <ProductCard key={simShoe.id} shoe={simShoe} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
