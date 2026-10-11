import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ShoeCategory } from '../../types/marketplace';
import { CATEGORIES_METADATA } from '../../data/mockData';

export const CategorySection: React.FC = () => {
  const { setActivePage, updateFilter } = useMarketplace();

  const handleSelectCategory = (cat: ShoeCategory) => {
    updateFilter('category', cat);
    setActivePage('shop');
  };

  return (
    <section id="categories-section" className="py-16 sm:py-20 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Curated Collections
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-stone-600 transition-colors"
          >
            <span>View All Styles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES_METADATA.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-xs border border-stone-200/80 bg-stone-900"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 opacity-85 group-hover:opacity-95"
              />
              {/* Subtle dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-x-3 bottom-3 text-white">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-300 block mb-0.5">
                  {cat.tag}
                </span>
                <h3 className="font-display text-base font-bold tracking-tight text-white group-hover:translate-x-0.5 transition-transform">
                  {cat.name}
                </h3>
                <div className="mt-1 flex items-center justify-between text-[11px] text-stone-300">
                  <span>{cat.count}+ pairs</span>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
