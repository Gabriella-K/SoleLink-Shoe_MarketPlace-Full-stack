import React, { useState } from 'react';
import { X, Send, Phone, MessageCircle, MapPin, Store, CheckCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const ContactVendorModal: React.FC = () => {
  const { contactVendorShoe, setContactVendorShoe, vendors, showToast } = useMarketplace();
  const [message, setMessage] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('42');
  const [isSent, setIsSent] = useState(false);

  if (!contactVendorShoe) return null;

  const vendor = vendors.find((v) => v.id === contactVendorShoe.vendorId) || vendors[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    showToast(`Inquiry sent to ${vendor.name}! They will respond via phone/SMS.`);
    setTimeout(() => {
      setIsSent(false);
      setContactVendorShoe(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-stone-200 relative">
        <button
          type="button"
          onClick={() => setContactVendorShoe(null)}
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
            <img
              src={vendor.logo}
              alt={vendor.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">Contact {vendor.name}</h3>
            <p className="text-[11px] text-stone-500">{vendor.location}</p>
          </div>
        </div>

        {isSent ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-stone-900">Message Dispatched</h4>
            <p className="text-xs text-stone-500">
              The merchant at {vendor.name} will reply shortly to your inquiry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 pt-4 text-xs">
            {/* Shoe Context Box */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
              <img
                src={contactVendorShoe.images[0]}
                alt={contactVendorShoe.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover bg-stone-200"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] font-semibold uppercase text-stone-400">
                  Regarding Footwear
                </span>
                <div className="font-bold text-stone-900 truncate">
                  {contactVendorShoe.name}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  {contactVendorShoe.brand}
                </div>
              </div>
            </div>

            {/* Inquired Size */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Inquiring about EU Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              >
                {contactVendorShoe.sizes.map((s) => (
                  <option key={s} value={s}>
                    EU Size {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Your Question</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about wide fitting, in-store trial at Kigali Heights, or custom reservations..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Direct Instant Channels */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
              <span className="font-medium">Direct Store Line:</span>
              <a
                href={`tel:${vendor.phone}`}
                className="font-mono text-stone-900 font-bold hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{vendor.phone}</span>
              </a>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContactVendorShoe(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
