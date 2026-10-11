import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  ShieldCheck,
  ArrowLeft,
  Store,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';

export const PublicVendorStore: React.FC = () => {
  const { selectedVendorId, vendors, shoes, setActivePage } = useMarketplace();

  const vendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  const vendorShoes = shoes.filter((s) => s.vendorId === vendor.id);

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all marketplace vendors</span>
          </button>
        </div>

        {/* Vendor Profile Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden mb-12">
          {/* Banner */}
          <div className="h-44 sm:h-56 relative bg-stone-900">
            <img
              src={vendor.coverImage}
              alt={vendor.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          </div>

          {/* Profile details */}
          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-stone-100">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white p-1.5 shadow-md border border-stone-200 shrink-0">
                  <img
                    src={vendor.logo}
                    alt={vendor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                      {vendor.name}
                    </h1>
                    {vendor.verified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Store</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 font-medium">
                    {vendor.tagline}
                  </p>
                </div>
              </div>

              {/* Rating & Product Count badge */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-900 font-bold font-mono text-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{vendor.rating}</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {vendor.reviewCount} reviews
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="font-bold font-mono text-sm text-stone-900 block">
                    {vendorShoes.length}
                  </span>
                  <span className="text-[10px] text-stone-500">Active Shoes</span>
                </div>
              </div>
            </div>

            {/* Vendor Contact & Hours Strip */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Physical Store</strong>
                  <span>{vendor.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Hotline / WhatsApp</strong>
                  <span className="font-mono">{vendor.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Direct Inquiries</strong>
                  <span>{vendor.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Operating Hours</strong>
                  <span>{vendor.openingHours}</span>
                </div>
              </div>
            </div>

            {/* About Narrative */}
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-2">
                About the Store
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
                {vendor.about}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Shop this vendor's shoes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                In-Stock Footwear
              </span>
              <h2 className="font-display text-2xl font-bold text-stone-900 tracking-tight">
                Shop {vendor.name}'s Collection
              </h2>
            </div>

            <span className="text-xs font-mono text-stone-500 tabular-nums">
              {vendorShoes.length} models available
            </span>
          </div>

          {vendorShoes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {vendorShoes.map((shoe) => (
                <ProductCard key={shoe.id} shoe={shoe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 text-xs text-stone-500">
              This vendor has no active shoes listed right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
