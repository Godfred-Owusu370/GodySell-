import React from 'react';
import { useApp } from '../context/AppContext';
import { GodySellLogo } from './GodySellLogo';
import { Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedRegion, setSelectedCategory } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {/* Brand & About */}
          <div className="space-y-3 col-span-2 sm:col-span-3 md:col-span-1">
            <div className="inline-block">
              <GodySellLogo size="md" showSubtitle inverted />
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] mt-2">
              Ghana&apos;s trusted marketplace for buying and selling vehicles, phones, real estate, electronics, and essentials with verified seller contacts.
            </p>
          </div>

          {/* Popular Regions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Regions
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern'].map((reg) => (
                <li key={reg}>
                  <button
                    onClick={() => {
                      setSelectedRegion(reg);
                      setActiveView('marketplace');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {reg}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Categories
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {[
                'Vehicles',
                'Property & Real Estate',
                'Mobile Phones & Tablets',
                'Electronics & Appliances',
                'Fashion & Beauty',
                'Others'
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveView('marketplace');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Tools */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Seller Tools
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    setActiveView('management');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Inventory Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('management');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Sales Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('management');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Order Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('management');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Campaign Banner
                </button>
              </li>
            </ul>
          </div>

          {/* Helplines */}
          <div className="space-y-2.5 col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Helplines
            </h4>
            <p className="text-[11px] text-slate-400">
              Customer support &amp; assistance:
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="tel:0503862329"
                className="flex items-center gap-2.5 text-white hover:text-emerald-300 transition-colors font-medium text-xs bg-slate-800 hover:bg-slate-700/80 px-3 py-2 rounded-lg border border-slate-700"
                title="Call 0503862329"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold tracking-wide">0503862329</span>
              </a>

              <a
                href="tel:0592836664"
                className="flex items-center gap-2.5 text-white hover:text-emerald-300 transition-colors font-medium text-xs bg-slate-800 hover:bg-slate-700/80 px-3 py-2 rounded-lg border border-slate-700"
                title="Call 0592836664"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold tracking-wide">0592836664</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} GodySell Ghana. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
