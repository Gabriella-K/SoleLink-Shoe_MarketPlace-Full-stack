import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const Footer: React.FC = () => {
  const { setActivePage, switchDemoPersona, setVendorDashboardTab } = useMarketplace();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800 text-sm">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-display font-bold text-2xl tracking-tight text-white uppercase">
              SoleLink
            </span>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              A unified footwear marketplace bridging trusted independent shoe vendors in Kigali with discerning buyers. Direct verified sizing, genuine materials, and seamless local delivery.
            </p>
            <div className="text-xs text-stone-500 pt-2 space-y-1">
              <div>Kigali Headquarters: KG 7 Ave, Gasabo District</div>
              <div>Hotline & Support: +250 788 123 456</div>
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="hover:text-white transition-colors"
                >
                  All Footwear
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('home');
                    setTimeout(() => {
                      document.getElementById('bestsellers-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('home');
                    setTimeout(() => {
                      document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('home');
                    setTimeout(() => {
                      document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Verified Vendors
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: For Vendors */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              For Vendors
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoPersona('vendor');
                    setActivePage('vendor-dashboard');
                    setVendorDashboardTab('add-shoe');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  List Your Footwear
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoPersona('vendor');
                    setActivePage('vendor-dashboard');
                    setVendorDashboardTab('inventory');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Inventory Management
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoPersona('vendor');
                    setActivePage('vendor-dashboard');
                    setVendorDashboardTab('store-profile');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Store Profile Settings
                </button>
              </li>
              <li>
                <span className="text-stone-500">Vendor Verification Policy</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Kigali Delivery & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Assurance
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p>Same-day or next-day delivery across Gasabo, Nyarugenge, and Kicukiro.</p>
              <p>Authenticity verified prior to dispatch.</p>
              <p className="text-stone-500 pt-1">Cash on Delivery or Mobile Money upon inspection supported.</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} SoleLink Marketplace Rwanda. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Independent Footwear Federation</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
