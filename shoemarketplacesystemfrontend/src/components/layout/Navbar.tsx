import React, { useState } from 'react';
import { ShoppingBag, Search, User, Store, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const {
    userRole,
    currentUser,
    activeBuyer,
    activeVendor,
    vendors,
    logout,
    activePage,
    setActivePage,
    cartCount,
    setBuyerDashboardTab,
    setVendorDashboardTab,
    applySmartSearch,
    isAuthenticated,
  } = useMarketplace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      applySmartSearch(searchVal.trim());
      setSearchVal('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="text-left font-display font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900 hover:text-stone-700 transition-colors uppercase"
        >
          SoleLink
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className={`hover:text-stone-900 transition-colors ${
              activePage === 'shop' ? 'text-stone-900 font-semibold' : ''
            }`}
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('home');
              setTimeout(() => {
                document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-stone-900 transition-colors"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('home');
              setTimeout(() => {
                document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-stone-900 transition-colors"
          >
            Vendors
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('home');
              setTimeout(() => {
                document.getElementById('bestsellers-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-stone-900 transition-colors"
          >
            Best Sellers
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('home');
              setTimeout(() => {
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-stone-900 transition-colors"
          >
            About
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Input Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search sneakers, boots, size 42..."
                  autoFocus
                  className="w-48 sm:w-64 px-3 py-1.5 text-xs bg-stone-100 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 text-stone-500 hover:text-stone-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search footwear"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Shopping Cart button */}
          <button
            type="button"
            onClick={() => setActivePage('cart')}
            aria-label="View Shopping Cart"
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white font-mono tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account / Dashboard Button & Dropdown */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 transition-colors"
              >
                {userRole === 'buyer' && activeBuyer ? (
                  <>
                    <User className="w-3.5 h-3.5 text-stone-700" />
                    <span>{activeBuyer.fullName.split(' ')[0]}</span>
                  </>
                ) : activeVendor ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-stone-800" />
                    <span>{activeVendor.name}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-stone-700" />
                    <span>Account</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 p-2 text-xs"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <div className="font-semibold text-stone-900">
                      {userRole === 'buyer' ? activeBuyer?.fullName : activeVendor?.name}
                    </div>
                    <div className="text-[11px] text-stone-500 capitalize">
                      {userRole} Account {activeBuyer ? `· ${activeBuyer.district}` : `· ${activeVendor?.location}`}
                    </div>
                  </div>

                  {userRole === 'buyer' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage('buyer-dashboard');
                        setBuyerDashboardTab('overview');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-medium transition-colors flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>Buyer Dashboard</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage('vendor-dashboard');
                        setVendorDashboardTab('overview');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-medium transition-colors flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-stone-700" />
                      <span>Vendor Dashboard</span>
                    </button>
                  )}

                  <div className="pt-1.5 mt-1.5 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
            <button
              type="button"
              onClick={() => {
                setActivePage('shop');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-stone-900"
            >
              Shop All Shoes
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-left py-1.5 hover:text-stone-900"
            >
              Browse Categories
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-left py-1.5 hover:text-stone-900"
            >
              Kigali Vendors
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('cart');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-stone-900 flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-stone-900 text-white font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            {isAuthenticated && userRole === 'buyer' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('buyer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 bg-stone-100 font-semibold text-xs rounded-lg text-stone-900"
                >
                  Go to Buyer Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg border border-rose-200"
                >
                  Sign Out
                </button>
              </>
            )}
            {isAuthenticated && userRole === 'vendor' && activeVendor && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('vendor-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 bg-stone-900 font-semibold text-xs rounded-lg text-white"
                >
                  Go to Vendor Dashboard ({activeVendor.name})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg border border-rose-200"
                >
                  Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 bg-stone-900 font-semibold text-xs rounded-lg text-white"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
