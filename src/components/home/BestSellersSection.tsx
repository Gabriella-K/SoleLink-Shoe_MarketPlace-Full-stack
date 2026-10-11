import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';

export const BestSellersSection: React.FC = () => {
  const { shoes, setActivePage } = useMarketplace();

  // Pick best seller shoes
  const bestSellers = shoes.filter((s) => s.isBestSeller).slice(0, 5);

  return (
    <section id="bestsellers-section" className="py-16 sm:py-20 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Trending in Kigali</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Best Sellers
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-stone-600 transition-colors"
          >
            <span>View All Popular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 to 5 products per row grid matching the reference image layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {bestSellers.map((shoe) => (
            <ProductCard key={shoe.id} shoe={shoe} />
          ))}
        </div>
      </div>
    </section>
  );
};
