import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';
import { ShoeCategory, ShoeCondition } from '../../types/marketplace';
import { formatRWF } from '../../data/mockData';

export const ExploreSection: React.FC = () => {
  const {
    shoes,
    vendors,
    filters,
    updateFilter,
    resetFilters,
  } = useMarketplace();

  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  const categories: ShoeCategory[] = ['Sneakers', 'Running', 'Formal', 'Boots', 'Sandals', 'Casual'];
  const sizes = [38, 39, 40, 41, 42, 43, 44, 45];
  const brands = Array.from(new Set(shoes.map((s) => s.brand)));

  // Filter application
  const filteredShoes = shoes.filter((shoe) => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = shoe.name.toLowerCase().includes(q);
      const matchBrand = shoe.brand.toLowerCase().includes(q);
      const matchCat = shoe.category.toLowerCase().includes(q);
      const matchDesc = shoe.description.toLowerCase().includes(q);
      const vendor = vendors.find((v) => v.id === shoe.vendorId);
      const matchVendor = vendor?.name.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCat && !matchDesc && !matchVendor) return false;
    }

    // Category
    if (filters.category !== 'All' && shoe.category !== filters.category) {
      return false;
    }

    // Brand
    if (filters.brand !== 'All' && shoe.brand !== filters.brand) {
      return false;
    }

    // Size
    if (filters.size !== 'All' && !shoe.sizes.includes(filters.size as number)) {
      return false;
    }

    // Condition
    if (filters.condition !== 'All' && shoe.condition !== filters.condition) {
      return false;
    }

    // Vendor
    if (filters.vendorId !== 'All' && shoe.vendorId !== filters.vendorId) {
      return false;
    }

    // Price
    if (shoe.price < filters.minPrice || shoe.price > filters.maxPrice) {
      return false;
    }

    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('searchQuery', localSearch);
  };

  return (
    <section id="explore-section" className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Browse The Entire Marketplace
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Explore Shoes
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Search through independent storefronts across Kigali by brand, size, style, or budget.
          </p>
        </div>

        {/* Large Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                updateFilter('searchQuery', e.target.value);
              }}
              placeholder="Search for sneakers, boots, loafers, Nike, or size 42..."
              className="w-full pl-11 pr-28 py-3.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white text-sm transition-all shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 mb-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Category Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-stone-500 font-medium mr-1 hidden sm:inline">Category:</span>
              <button
                type="button"
                onClick={() => updateFilter('category', 'All')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filters.category === 'All'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateFilter('category', cat)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    filters.category === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                resetFilters();
              }}
              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Secondary Quick Selectors: Size, Brand, Condition, Vendor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200/60 text-xs">
            {/* Size Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                EU Shoe Size
              </label>
              <select
                value={filters.size}
                onChange={(e) =>
                  updateFilter('size', e.target.value === 'All' ? 'All' : parseInt(e.target.value, 10))
                }
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Sizes</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    EU {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => updateFilter('condition', e.target.value as ShoeCondition | 'All')}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Conditions</option>
                <option value="New">Brand New</option>
                <option value="Used - Like New">Used - Like New</option>
                <option value="Used - Good">Used - Good</option>
              </select>
            </div>

            {/* Vendor Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">Kigali Vendor</label>
              <select
                value={filters.vendorId}
                onChange={(e) => updateFilter('vendorId', e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter and Active Results */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-6">
          <div>
            Showing <span className="font-semibold text-stone-900 tabular-nums">{filteredShoes.length}</span> shoes found
          </div>
          {filters.searchQuery && (
            <div className="text-stone-700">
              Matching <span className="font-medium">"{filters.searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredShoes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredShoes.map((shoe) => (
              <ProductCard key={shoe.id} shoe={shoe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
            <h3 className="font-semibold text-stone-800 text-base">No matching footwear found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              We couldn't find shoes matching your exact criteria. Try resetting filters or adjusting size and category.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
