import React from 'react';
import { MapPin, Star, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const VendorDiscoverySection: React.FC = () => {
  const { vendors, shoes, openVendorStore } = useMarketplace();

  return (
    <section id="vendors-section" className="py-16 sm:py-20 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Independent Boutiques
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Shop From Local Vendors
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Support authentic shoe merchants based in Kigali Heights, Nyarugenge, Kimironko, and Remera with direct warranty and in-store pick-up options.
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => {
            const vendorShoeCount = shoes.filter((s) => s.vendorId === vendor.id).length;

            return (
              <div
                key={vendor.id}
                className="group relative flex flex-col justify-between bg-stone-50/70 border border-stone-200/90 rounded-xl p-5 hover:bg-white hover:border-stone-300 hover:shadow-md transition-all duration-300"
              >
                <div>
                  {/* Top line: Logo & Rating */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-stone-200 p-1">
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-700 bg-white px-2 py-1 rounded-md border border-stone-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold font-mono tabular-nums">{vendor.rating}</span>
                      <span className="text-stone-400 text-[10px]">({vendor.reviewCount})</span>
                    </div>
                  </div>

                  {/* Vendor Name & Verification */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-display text-base font-bold text-stone-900 group-hover:text-stone-700 transition-colors">
                      {vendor.name}
                    </h3>
                    {vendor.verified && (
                      <span title="Verified Vendor" className="inline-flex text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                    <span className="truncate">{vendor.location}</span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {vendor.tagline}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                    <span className="font-semibold text-stone-800">{vendorShoeCount}</span> shoes available
                  </div>

                  <button
                    type="button"
                    onClick={() => openVendorStore(vendor.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 group-hover:underline underline-offset-4"
                  >
                    <span>View Store</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
