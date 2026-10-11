import React, { useEffect, useState } from 'react';
import { X, User, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'buyer' | 'vendor';
  initialType?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialRole, initialType }) => {
  const { login, registerBuyer, registerVendor, setActivePage, setBuyerDashboardTab, setVendorDashboardTab } =
    useMarketplace();

  const [roleMode, setRoleMode] = useState<'buyer' | 'vendor'>('buyer');
  const [authType, setAuthType] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('Kigali Heights, Gasabo');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Each time the pop-up opens, start on the tab the caller asked for
  useEffect(() => {
    if (isOpen) {
      setRoleMode(initialRole ?? 'buyer');
      setAuthType(initialType ?? 'login');
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen, initialRole, initialType]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    setErrorMessage(null);

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (authType === 'login') {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return false;
      }
      return true;
    }

    if (authType === 'register') {
      if (password.length < 8) {
        setErrorMessage('Password must contain at least 8 characters.');
        return false;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return false;
      }

      if (!phone || phone.length < 8) {
        setErrorMessage('Please enter a valid phone number.');
        return false;
      }

      if (roleMode === 'buyer') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          return false;
        }
      } else {
        if (!ownerName.trim()) {
          setErrorMessage('Please enter the owner full name.');
          return false;
        }
        if (!shopName.trim()) {
          setErrorMessage('Please enter the footwear shop name.');
          return false;
        }
        if (!location.trim()) {
          setErrorMessage('Please enter the shop location in Kigali.');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (authType === 'login') {
        const res = await login(email, password);
        if (res.role === 'buyer') {
          setActivePage('buyer-dashboard');
          setBuyerDashboardTab('overview');
        } else {
          setActivePage('vendor-dashboard');
          setVendorDashboardTab('overview');
        }
        onClose();
      } else if (authType === 'register') {
        if (roleMode === 'buyer') {
          await registerBuyer({
            fullName,
            email,
            phone,
            password,
            confirmPassword,
          });
          setActivePage('buyer-dashboard');
          setBuyerDashboardTab('overview');
        } else {
          await registerVendor({
            ownerName,
            shopName,
            email,
            phone,
            location,
            password,
            confirmPassword,
          });
          setActivePage('vendor-dashboard');
          setVendorDashboardTab('overview');
        }
        onClose();
      } else if (authType === 'forgot') {
        setSuccessInfo(`Password reset instructions have been dispatched to ${email}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Switcher Tabs */}
        <div className="flex p-1 bg-stone-100 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setRoleMode('buyer');
              setAuthType('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              roleMode === 'buyer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Buyer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleMode('vendor');
              setAuthType('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              roleMode === 'vendor'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>Vendor Partner</span>
          </button>
        </div>

        {/* Modal Title */}
        <div className="mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
            {roleMode === 'buyer'
              ? authType === 'login'
                ? 'Welcome Back to SoleLink'
                : authType === 'register'
                ? 'Create a Buyer Account'
                : 'Reset Buyer Password'
              : authType === 'login'
              ? 'Vendor Store Login'
              : authType === 'register'
              ? 'Register Your Shoe Store'
              : 'Reset Vendor Password'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {roleMode === 'buyer'
              ? 'Discover and purchase verified footwear across Kigali.'
              : 'Manage inventory, incoming buyer orders, and sales performance.'}
          </p>
        </div>

        {/* Error / Success Display */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Real Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* BUYER REGISTRATION FIELDS */}
          {roleMode === 'buyer' && authType === 'register' && (
            <>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jean-Luc Munyaneza"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 000 000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>
            </>
          )}

          {/* VENDOR REGISTRATION FIELDS */}
          {roleMode === 'vendor' && authType === 'register' && (
            <>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Shop / Store Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Kigali Footwear Boutique"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Store Owner Full Name</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Patrick Mugisha"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Kigali Retail Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nyarugenge Commercial District, KN 2 Ave"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Business Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 123 456"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>
            </>
          )}

          {/* Email input */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Password inputs */}
          {authType !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-stone-700 font-semibold">Password</label>
                {authType === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthType('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-900 underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          )}

          {authType === 'register' && (
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 disabled:bg-stone-400 transition-colors shadow-xs"
          >
            {isSubmitting
              ? 'Processing...'
              : authType === 'login'
              ? `Sign In as ${roleMode === 'buyer' ? 'Buyer' : 'Vendor'}`
              : authType === 'register'
              ? `Complete ${roleMode === 'buyer' ? 'Buyer' : 'Vendor'} Registration`
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-5 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          {authType === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthType('register');
                  setErrorMessage(null);
                }}
                className="font-semibold text-stone-900 underline underline-offset-2 ml-1"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthType('login');
                  setErrorMessage(null);
                }}
                className="font-semibold text-stone-900 underline underline-offset-2 ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
