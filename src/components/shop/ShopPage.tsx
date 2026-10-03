import React, { useState } from 'react';
import { SlidersHorizontal, X, Search, RotateCcw, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';
import { ShoeCategory, ShoeCondition } from '../../types/marketplace';
import { formatRWF } from '../../data/mockData';

export const ShopPage: React.FC = () => {
  const {
    shoes,
    totalShoesCount,
    vendors,
    filters,
    updateFilter,
    resetFilters,
    isLoading,
  } = useMarketplace();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const categories: ShoeCategory[] = ['Sneakers', 'Running', 'Formal', 'Boots', 'Sandals', 'Casual'];
  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
  const brands = Array.from(new Set(shoes.map((s) => s.brand))).sort();

  // Filter Sidebar Content (shared between desktop sidebar and mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6 text-xs text-stone-700">
      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
          Search Marketplace
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search keywords, Nike, running..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-2 top-2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
            Category
          </span>
          {filters.category !== 'All' && (
            <button
              type="button"
              onClick={() => updateFilter('category', 'All')}
              className="text-[10px] text-stone-500 hover:text-stone-900 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateFilter('category', 'All')}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors text-left ${
              filters.category === 'All'
                ? 'bg-stone-900 text-white font-medium'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => updateFilter('category', cat)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors text-left ${
                  isSelected
                    ? 'bg-stone-900 text-white font-medium'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoe Sizes */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
            EU Size
          </span>
          {filters.size !== 'All' && (
            <button
              type="button"
              onClick={() => updateFilter('size', 'All')}
              className="text-[10px] text-stone-500 hover:text-stone-900 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => updateFilter('size', 'All')}
            className={`py-1.5 rounded border text-center font-mono text-xs transition-colors ${
              filters.size === 'All'
                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
            }`}
          >
            All
          </button>
          {sizes.map((s) => {
            const isSelected = filters.size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => updateFilter('size', s)}
                className={`py-1.5 rounded border text-center font-mono text-xs transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
            Brand
          </span>
          {filters.brand !== 'All' && (
            <button
              type="button"
              onClick={() => updateFilter('brand', 'All')}
              className="text-[10px] text-stone-500 hover:text-stone-900 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateFilter('brand', 'All')}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
              filters.brand === 'All'
                ? 'bg-stone-900 text-white font-medium'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <span>All Brands</span>
          </button>
          {brands.map((b) => {
            const isSelected = filters.brand === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => updateFilter('brand', b)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white font-medium'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span className="truncate">{b}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-stone-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 block mb-2">
          Max Price: {formatRWF(filters.maxPrice)}
        </span>
        <input
          type="range"
          min="30000"
          max="150000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value, 10))}
          className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-500 mt-1 font-mono">
          <span>{formatRWF(30000)}</span>
          <span>{formatRWF(150000)}</span>
        </div>
      </div>

      {/* Condition */}
      <div className="pt-4 border-t border-stone-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 block mb-2">
          Condition
        </span>
        <div className="space-y-1">
          {[
            { label: 'All Conditions', value: 'All' },
            { label: 'Brand New', value: 'New' },
            { label: 'Used / Curated Pre-owned', value: 'Used - Like New' },
          ].map((cond) => {
            const isSelected = filters.condition === cond.value;
            return (
              <button
                key={cond.value}
                type="button"
                onClick={() => updateFilter('condition', cond.value as any)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white font-medium'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span>{cond.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
            Vendor Store
          </span>
          {filters.vendorId !== 'All' && (
            <button
              type="button"
              onClick={() => updateFilter('vendorId', 'All')}
              className="text-[10px] text-stone-500 hover:text-stone-900 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateFilter('vendorId', 'All')}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
              filters.vendorId === 'All'
                ? 'bg-stone-900 text-white font-medium'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <span>All Stores</span>
          </button>
          {vendors.map((v) => {
            const isSelected = filters.vendorId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => updateFilter('vendorId', v.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white font-medium'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span className="truncate">{v.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Marketplace</span>
            <span aria-hidden="true">·</span>
            <span>All Shoes</span>
            {filters.category !== 'All' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-stone-900 font-medium">{filters.category}</span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {filters.searchQuery
                ? `${shoes.length} results for "${filters.searchQuery}"`
                : filters.category !== 'All'
                ? `${filters.category} Collection`
                : 'Marketplace Footwear'}
            </h1>

            {/* Sort & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 hidden sm:inline">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs sticky top-24">
            <FilterContent />
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Showing <strong className="text-stone-900 tabular-nums">{shoes.length}</strong> available pairs
              </span>
              {(filters.category !== 'All' ||
                filters.brand !== 'All' ||
                filters.size !== 'All' ||
                filters.vendorId !== 'All' ||
                filters.condition !== 'All' ||
                filters.searchQuery) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-stone-900 underline underline-offset-2 hover:text-stone-600 font-medium"
                >
                  Clear active filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-stone-200 rounded-xl overflow-hidden p-4 space-y-3 animate-pulse">
                    <div className="aspect-[4/3] bg-stone-200 rounded-lg" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                    <div className="h-5 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : shoes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shoes.map((shoe) => (
                  <ProductCard key={shoe.id} shoe={shoe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-stone-200 p-8 space-y-3">
                <h3 className="font-display font-bold text-base text-stone-900">
                  No footwear matches your selected criteria
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try broadening your price range, clearing brand constraints, or resetting size filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <h3 className="font-display font-bold text-base text-stone-900">Filter Footwear</h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </div>

            <div className="pt-6 border-t border-stone-200 mt-6">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Apply Filters ({shoes.length} pairs)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
