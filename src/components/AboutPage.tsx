import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';

const HOMEPAGE_TITLE = 'Godysell – Your Trusted Ghanaian Marketplace & Seller Hub';
const HOMEPAGE_DESCRIPTION =
  'Buy and sell verified products across Ghana on Godysell. Real-time marketplace with seamless seller inventory, orders, chat, and fast delivery.';
const HOMEPAGE_CANONICAL = 'https://www.godysell.store/';

const ABOUT_TITLE = 'About Godysell | Founded by Godfred Owusu';
const ABOUT_DESCRIPTION =
  'Learn about Godysell, the Ghanaian online marketplace for buying and selling products, founded by Godfred Owusu.';
const ABOUT_CANONICAL = 'https://www.godysell.store/about';

export const AboutPage: React.FC = () => {
  const { setActiveView } = useApp();

  // SEO Management for SPA (updates Title, Meta Description, and Canonical Link)
  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    document.title = ABOUT_TITLE;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : HOMEPAGE_DESCRIPTION;
    if (metaDesc) {
      metaDesc.content = ABOUT_DESCRIPTION;
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = ABOUT_DESCRIPTION;
      document.head.appendChild(metaDesc);
    }

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonical = canonicalLink ? canonicalLink.href : HOMEPAGE_CANONICAL;
    if (canonicalLink) {
      canonicalLink.href = ABOUT_CANONICAL;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = ABOUT_CANONICAL;
      document.head.appendChild(canonicalLink);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cleanup: restore homepage title, description, and canonical link when navigating away
    return () => {
      document.title = originalTitle || HOMEPAGE_TITLE;
      if (metaDesc) {
        metaDesc.content = originalDesc || HOMEPAGE_DESCRIPTION;
      }
      if (canonicalLink) {
        canonicalLink.href = originalCanonical || HOMEPAGE_CANONICAL;
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActiveView('marketplace')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Main Content Article */}
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner Accent */}
        <div className="h-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800" />

        <div className="p-6 sm:p-10 space-y-8">
          {/* Header */}
          <header className="space-y-3 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ghanaian Online Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              About Godysell
            </h1>
          </header>

          {/* Description of What Godysell Does */}
          <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            <p>
              Godysell is a Ghanaian online marketplace where people can buy and sell products.
              The platform connects buyers and sellers across Ghana, enabling users to list items,
              discover verified deals in categories such as mobile phones, vehicles, electronics,
              fashion, property, and everyday essentials, communicate directly with sellers, and manage
              orders and inventory in real time.
            </p>
          </section>

          {/* Founder Section */}
          <section
            id="godfred-owusu"
            className="pt-6 border-t border-slate-100 space-y-5 scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Founder
              </h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                Godysell was founded by Godfred Owusu.
              </p>

              {/* Founder Social & Professional Profiles */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Connect with Godfred Owusu:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/godfred-owusu-6196543a3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/godfred_870"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@owusu.godfred870"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* =========================================================================
                PLACEHOLDER FOR FOUNDING STORY & FOUNDING YEAR:
                The site owner can add the official founding story and founding year here.
                (Note: Kept as a clean placeholder per instructions without invented dates or claims)
                ========================================================================= */}
            {/* <!-- FOUNDING_STORY_PLACEHOLDER_START --> */}
            {/* Future content: Add founding story, launch year, and company milestone narrative here */}
            {/* <!-- FOUNDING_STORY_PLACEHOLDER_END --> */}
          </section>

          {/* Quick Platform Guarantee Badges */}
          <footer className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Seller Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Free to List &amp; Sell Nationwide</span>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
};
