import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF } from '../../data/mockData';
import heroEditorialImg from '../../assets/images/hero_editorial_sneakers_1791024851058.jpg';
import strideRunnerImg from '../../assets/images/product_stride_runner_1791024866210.jpg';

export const HeroSection: React.FC = () => {
  const { setActivePage, openShoeDetail, shoes, vendors } = useMarketplace();

  // Find a feature shoe for the floating preview card
  const previewShoe = shoes.find((s) => s.name === 'Stride Runner') || shoes[0];
  const previewVendor = vendors.find((v) => v.id === previewShoe?.vendorId);

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden bg-stone-900">
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroEditorialImg}
          className="w-full h-full object-cover object-center scale-105"
        >
          {/* High-quality, fast-loading streetwear & fashion footwear video */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-legs-of-a-person-walking-in-sneakers-on-a-pavement-41551-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            type="video/mp4"
          />
        </video>

        {/* Cinematic dark / warm neutral gradient overlay for pristine legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-stone-950/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-stone-950/20" />
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-1">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] text-balance">
                Find Your Next Pair.
              </h1>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-300 tracking-tight leading-[1.1] text-balance">
                From Every Corner.
              </h2>
            </div>

            <p className="text-stone-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed text-pretty">
              Discover shoes from trusted vendors in one place. Search by brand, size, category and price.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-stone-950 font-semibold text-sm hover:bg-stone-100 transition-all shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white whitespace-nowrap"
              >
                <span>Shop Shoes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-stone-900/60 backdrop-blur-md text-white border border-white/20 font-medium text-sm hover:bg-stone-900/80 transition-all focus-visible:outline-2 focus-visible:outline-white whitespace-nowrap"
              >
                <span>Explore Vendors</span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Floating Product Preview Card (inspired by reference image) */}
          {previewShoe && (
            <div className="lg:col-span-4 flex justify-end">
              <div
                onClick={() => openShoeDetail(previewShoe.id)}
                className="group w-full max-w-[270px] bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/30 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-stone-100 mb-3">
                  <img
                    src={previewShoe.images[0] || strideRunnerImg}
                    alt={previewShoe.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-xs backdrop-blur-xs">
                    Featured Arrival
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    {previewShoe.brand}
                  </div>
                  <div className="text-sm font-bold text-stone-900 line-clamp-1">
                    {previewShoe.name}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                      {formatRWF(previewShoe.price)}
                    </span>
                    {previewVendor && (
                      <span className="text-[11px] text-stone-500 truncate max-w-[110px]">
                        {previewVendor.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900 group-hover:text-stone-700">
                  <span>Explore Shoe</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
