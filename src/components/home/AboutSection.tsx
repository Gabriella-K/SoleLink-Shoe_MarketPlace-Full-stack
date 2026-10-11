import React from 'react';
import { CheckCircle2, Shield, Truck, Sparkles } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import categoryFormalImg from '../../assets/images/category_formal_leather_1791024899606.jpg';

export const AboutSection: React.FC = () => {
  const { setActivePage } = useMarketplace();

  return (
    <section id="about-section" className="py-20 bg-stone-900 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              The SoleLink Standard
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A Direct Connection To Independent Footwear Craft.
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Before SoleLink, shopping for genuine sneakers and handcrafted shoes across Kigali meant jumping between scattered Instagram pages, endless WhatsApp chats, and uncertain sizes.
            </p>

            <p className="text-stone-400 text-sm leading-relaxed">
              We partnered directly with Kigali's finest footwear stockists and leather artisans to create a single curated platform where condition is verified, stock is live, and delivery arrives at your door within 24 hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Hand-Inspected Pairs</span>
                  <span className="text-stone-400">Every shoe is physically verified for stitch integrity and authenticity.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Kigali-Wide Dispatch</span>
                  <span className="text-stone-400">Dispatched via trusted motorcycle and courier couriers with live tracking.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Verified Vendor Guarantee</span>
                  <span className="text-stone-400">All vendors maintain registered retail locations in Kigali commercial hubs.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Accurate EU Sizing</span>
                  <span className="text-stone-400">Uniform standardized size guide with vendor in-store fitting support.</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="px-6 py-3 rounded-lg bg-white text-stone-900 font-semibold text-xs hover:bg-stone-100 transition-colors"
              >
                Browse The Full Catalog
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
              <img
                src={categoryFormalImg}
                alt="SoleLink footwear craftsmanship"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800 text-xs">
                <div className="font-semibold text-white">Artisan Quality Assurance</div>
                <div className="text-stone-400 mt-0.5">Nyarugenge & Gasabo Footwear Workshops</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
