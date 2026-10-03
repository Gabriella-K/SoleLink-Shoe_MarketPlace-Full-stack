import React from 'react';
import { Store, SlidersHorizontal, ShieldCheck, Layers } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const features = [
    {
      icon: Store,
      title: 'Multiple Vendors',
      description: 'Discover footwear from different vendors in one marketplace.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Easy Search',
      description: 'Find shoes using size, brand, category and price filters.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Inventory',
      description: 'See structured shoe information before contacting or ordering.',
    },
    {
      icon: Layers,
      title: 'Flexible Shopping',
      description: 'Choose from different vendors and styles in one place.',
    },
  ];

  return (
    <section className="bg-white border-b border-stone-200/80 py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 ${idx > 0 ? 'pt-6 sm:pt-0 sm:pl-6' : ''}`}
              >
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 text-stone-800">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
