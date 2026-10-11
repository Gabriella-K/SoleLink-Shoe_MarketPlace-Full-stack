import React from 'react';
import { Heart, ArrowUpRight, Star } from 'lucide-react';
import { Shoe } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';

interface ProductCardProps {
  shoe: Shoe;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ shoe }) => {
  const { openShoeDetail, toggleFavorite, isFavorite, vendors } = useMarketplace();
  const vendor = vendors.find((v) => v.id === shoe.vendorId);
  const favorited = isFavorite(shoe.id);

  // Compute total available stock
  const totalStock = Object.values(shoe.stock || {}).reduce((a, b) => a + b, 0);

  return (
    <div
      onClick={() => openShoeDetail(shoe.id)}
      className="group relative flex flex-col bg-white border border-stone-200/80 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:border-stone-300"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={shoe.images[0]}
          alt={`${shoe.brand} ${shoe.name}`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(shoe.id);
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-stone-700 shadow-xs transition-colors hover:bg-white hover:text-red-500 focus-visible:outline-2 focus-visible:outline-stone-900"
        >
          <Heart
            className={`h-4 w-4 transition-transform active:scale-125 ${
              favorited ? 'fill-red-500 text-red-500' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Condition tag */}
        {shoe.condition !== 'New' && (
          <span className="absolute top-3 left-3 bg-stone-900/80 text-white backdrop-blur-xs text-[11px] font-medium px-2 py-0.5 rounded-sm">
            {shoe.condition}
          </span>
        )}

        {/* Quick reveal on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
          <div className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900/90 backdrop-blur-xs text-white text-xs font-medium rounded-lg shadow-sm">
            <span>View Shoe Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Product metadata */}
      <div className="flex flex-col p-4 flex-1 justify-between">
        <div>
          {/* Brand & Vendor line */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium tracking-wide uppercase text-[11px] text-stone-600 truncate">
              {shoe.brand}
            </span>
            {vendor && (
              <span className="truncate max-w-[120px] text-stone-400">
                {vendor.name}
              </span>
            )}
          </div>

          {/* Name - Manrope 600 */}
          <h3 className="font-display font-semibold text-sm text-stone-900 line-clamp-1 group-hover:text-stone-700 transition-colors">
            {shoe.name}
          </h3>

          {/* Available sizes */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
            <span>Sizes:</span>
            <span className="font-mono tabular-nums text-stone-700">
              {shoe.sizes.slice(0, 5).join(', ')}
              {shoe.sizes.length > 5 ? '+' : ''}
            </span>
          </div>
        </div>

        {/* Price & Rating line */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-stone-900 font-mono tabular-nums">
              {formatRWF(shoe.price)}
            </span>
            {shoe.originalPrice && (
              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                {formatRWF(shoe.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium tabular-nums">{shoe.rating.toFixed(1)}</span>
            <span className="text-stone-400 text-[10px]">({shoe.reviewCount})</span>
          </div>
        </div>

        {/* Low stock indicator if applicable */}
        {totalStock <= 3 && totalStock > 0 && (
          <p className="mt-1.5 text-[11px] text-stone-500 font-medium">
            Only {totalStock} pairs left in stock
          </p>
        )}
      </div>
    </div>
  );
};
