import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { ManagementDashboard } from './components/management/ManagementDashboard';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { ProductFormModal } from './components/management/ProductFormModal';
import { RecordSaleModal } from './components/management/RecordSaleModal';
import { BuyerChatModal } from './components/marketplace/BuyerChatModal';
import { BuyerSellerChatHub } from './components/chat/BuyerSellerChatHub';
import { GoogleLoginWall } from './components/auth/GoogleLoginWall';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

const MainLayout: React.FC = () => {
  const { activeView, user } = useApp();

  // If user is viewing /about, render the About page directly so search engine crawlers and guests can view it
  if (activeView === 'about') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
        <Header />
        <main className="flex-1 pb-20 md:pb-6 overflow-x-hidden min-w-0">
          <AboutPage />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // If user is not logged in with Google, require Google Sign-In before accessing the site
  if (!user) {
    return <GoogleLoginWall />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Header />
      <AnnouncementBanner />

      <main className="flex-1 pb-20 md:pb-6 overflow-x-hidden min-w-0">
        {activeView === 'marketplace' ? (
          <MarketplaceView />
        ) : activeView === 'management' ? (
          <ManagementDashboard />
        ) : activeView === 'chats' ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-6 overflow-hidden min-w-0">
            <BuyerSellerChatHub />
          </div>
        ) : (
          <AboutPage />
        )}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <ProductDetailModal />
      <ProductFormModal />
      <RecordSaleModal />
      <BuyerChatModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
