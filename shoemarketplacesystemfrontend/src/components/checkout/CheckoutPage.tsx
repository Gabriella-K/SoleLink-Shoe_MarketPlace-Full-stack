import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatRWF, KIGALI_DISTRICTS } from '../../data/mockData';
import { Order } from '../../types/marketplace';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    activeBuyer,
    placeOrder,
    setActivePage,
    setBuyerDashboardTab,
  } = useMarketplace();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states initialized with realistic buyer profile or defaults
  const [customerName, setCustomerName] = useState(activeBuyer?.fullName || 'Jean-Luc Munyaneza');
  const [email, setEmail] = useState(activeBuyer?.email || 'jeanluc.munyaneza@gmail.com');
  const [phone, setPhone] = useState(activeBuyer?.phone || '+250 788 345 678');
  const [district, setDistrict] = useState(activeBuyer?.district || KIGALI_DISTRICTS[0]);
  const [address, setAddress] = useState(activeBuyer?.address || 'KG 14 Ave, House 22, Kacyiru');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deliveryFee = 2500;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleNextStep = async () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!customerName.trim() || !phone.trim()) {
        setErrorMsg('Please enter customer full name and phone number.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!address.trim()) {
        setErrorMsg('Please specify a delivery street or house address.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const newOrder = await placeOrder({
          customerName,
          phone,
          district,
          address,
          notes,
        });
        setPlacedOrder(newOrder);
        setCurrentStep(4);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to place order. Please review your cart.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#FAFAF9]">
        <div className="text-center space-y-3 bg-white p-8 rounded-2xl border border-stone-200">
          <p className="text-stone-700 text-sm font-semibold">No items currently in your bag to checkout.</p>
          <button
            onClick={() => setActivePage('shop')}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Browse Footwear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 max-w-xl mx-auto">
            {[
              { num: 1, title: 'Customer Info' },
              { num: 2, title: 'Delivery Address' },
              { num: 3, title: 'Review & Terms' },
              { num: 4, title: 'Confirmation' },
            ].map((step, idx) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs ${
                        isDone
                          ? 'bg-stone-900 text-white'
                          : isCurrent
                          ? 'bg-stone-900 text-white ring-2 ring-stone-900 ring-offset-2'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    <span
                      className={`hidden sm:inline ${
                        isCurrent ? 'text-stone-900 font-bold' : ''
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < 3 && <div className="flex-1 h-[1px] bg-stone-200 mx-2" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200/90 shadow-xs">
          {/* STEP 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-stone-900">
                  Step 1: Customer Information
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your recipient contact information so the courier can reach you.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jean-Luc Munyaneza"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Phone Number (for Courier & SMS)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 000 000"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActivePage('cart')}
                  className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!customerName || !phone}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-xs"
                >
                  Continue to Delivery Address
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-stone-900">
                  Step 2: Delivery Address
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Specify your Kigali destination for direct dispatch from local stores.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Kigali District & Neighborhood
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  >
                    {KIGALI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Street Address / House / Office Location
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. KG 14 Ave, House 22, Kacyiru"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Delivery Instructions / Landmark (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call upon arriving at gate, or leave with front security."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Customer Info</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!address}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-xs"
                >
                  Continue to Order Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review & Placement */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-stone-900">
                  Step 3: Order Review & Settlement Terms
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Please verify your order items, delivery details, and payment preference.
                </p>
              </div>

              {/* Items in Order */}
              <div className="border border-stone-200 rounded-xl p-4 divide-y divide-stone-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Order Items ({cart.length})
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.shoe?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'}
                        alt={item.shoe?.name || 'Shoe'}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200"
                      />
                      <div>
                        <div className="font-semibold text-stone-900">{item.shoe?.name}</div>
                        <div className="text-stone-500 text-[11px]">
                          EU Size {item.size} · Vendor: {item.vendor?.name} · Qty {item.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {formatRWF(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery & Recipient Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">Recipient</span>
                  <p className="text-stone-700">{customerName}</p>
                  <p className="text-stone-500 font-mono">{phone}</p>
                  <p className="text-stone-500">{email}</p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">Delivery Destination</span>
                  <p className="text-stone-700">{address}</p>
                  <p className="text-stone-500">{district}</p>
                  {notes && <p className="text-stone-500 italic mt-1">"{notes}"</p>}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <span className="text-xs font-bold text-stone-900 block mb-2">
                  Select Settlement Preference
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-stone-900 bg-stone-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-stone-900"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Cash on Delivery</span>
                      <span className="text-stone-500 text-[11px]">
                        Inspect shoe fit first upon arrival, then hand payment to delivery courier.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('momo')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'momo'
                        ? 'border-stone-900 bg-stone-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="mt-0.5 accent-stone-900"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">MTN / Airtel Mobile Money</span>
                      <span className="text-stone-500 text-[11px]">
                        Pay direct via MoMo push upon shoe arrival & inspection.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatRWF(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Kigali Courier Dispatch</span>
                  <span className="font-mono tabular-nums">{formatRWF(deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Amount Due</span>
                  <span className="font-mono tabular-nums text-base">{formatRWF(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Delivery</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNextStep}
                  className="px-7 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-400 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Confirming Order...' : `Place Order (${formatRWF(grandTotal)})`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {currentStep === 4 && placedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  Order Successfully Placed
                </span>
                <h2 className="font-display text-2xl font-bold text-stone-900 mt-3">
                  Thank You, {placedOrder.buyerName.split(' ')[0]}!
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Your order reference is{' '}
                  <strong className="text-stone-900 font-mono text-sm">{placedOrder.id}</strong>.
                  Vendors have been notified and inventory has been reserved.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-stone-50 p-5 rounded-xl border border-stone-200 text-left text-xs space-y-3">
                <div className="flex justify-between pb-2 border-b border-stone-200 font-medium">
                  <span className="text-stone-500">Dispatch Status</span>
                  <span className="text-amber-700 font-semibold">{placedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Destination</span>
                  <span className="text-stone-900 text-right truncate max-w-[200px]">
                    {placedOrder.buyerAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Settlement</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatRWF(placedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActivePage('buyer-dashboard');
                    setBuyerDashboardTab('orders');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Track Order in Buyer Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="w-full sm:w-auto px-6 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
