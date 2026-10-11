import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { TrustSection } from './components/home/TrustSection';
import { ExploreSection } from './components/home/ExploreSection';
import { CategorySection } from './components/home/CategorySection';
import { BestSellersSection } from './components/home/BestSellersSection';
import { VendorDiscoverySection } from './components/home/VendorDiscoverySection';
import { AboutSection } from './components/home/AboutSection';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { BuyerDashboard } from './components/buyer/BuyerDashboard';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { PublicVendorStore } from './components/vendor/PublicVendorStore';
import { AuthModal } from './components/auth/AuthModal';
import { ContactVendorModal } from './components/common/ContactVendorModal';
import { CheckCircle2 } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const { activePage, toastMessage, authModal, openAuthModal, closeAuthModal } = useMarketplace();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#18181B]">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => openAuthModal()} />

      {/* Main View Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <HeroSection />
            <TrustSection />
            <ExploreSection />
            <CategorySection />
            <BestSellersSection />
            <VendorDiscoverySection />
            <AboutSection />
          </>
        )}

        {activePage === 'shop' && <ShopPage />}

        {activePage === 'shoe-detail' && <ProductDetailPage />}

        {activePage === 'vendor-store' && <PublicVendorStore />}

        {activePage === 'cart' && <CartPage />}

        {activePage === 'checkout' && <CheckoutPage />}

        {activePage === 'buyer-dashboard' && <BuyerDashboard />}

        {activePage === 'vendor-dashboard' && <VendorDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuthModal}
        initialRole={authModal.role}
        initialType={authModal.type}
      />
      <ContactVendorModal />

      {/* Discreet Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-stone-900 text-white rounded-xl shadow-xl text-xs font-medium border border-stone-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
