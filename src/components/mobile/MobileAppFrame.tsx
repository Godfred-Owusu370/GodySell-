import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Bookmark,
  PlusCircle,
  MessageSquare,
  Layers,
  Search,
  MapPin,
  Filter,
  Monitor,
  LogOut,
  X,
  UserCheck,
  Camera
} from 'lucide-react';
import { ProductCard } from '../marketplace/ProductCard';
import { CATEGORIES_WITH_META, GHANA_REGIONS } from '../../data/initialProducts';
import { ManagementDashboard } from '../management/ManagementDashboard';
import { BuyerSellerChatHub } from '../chat/BuyerSellerChatHub';

export const MobileAppFrame: React.FC = () => {
  const {
    products,
    favorites,
    inquiries,
    totalUnreadChatCount,
    selectedCategory,
    setSelectedCategory,
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    openCreateProductModal,
    setDeviceMode,
    activeView,
    setActiveView,
    user,
    updateUserProfile,
    logout
  } = useApp();

  const [mobileTab, setMobileTab] = useState<'home' | 'saved' | 'chat' | 'hub'>('home');
  const [showUserSheet, setShowUserSheet] = useState(false);

  // Sync mobileTab with global activeView
  useEffect(() => {
    if (activeView === 'chats') {
      setMobileTab('chat');
    } else if (activeView === 'management') {
      setMobileTab('hub');
    } else if (activeView === 'marketplace') {
      if (mobileTab === 'chat' || mobileTab === 'hub') {
        setMobileTab('home');
      }
    }
  }, [activeView]);

  // Filter products for mobile feed
  const displayProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesRegion = !selectedRegion || p.region === selectedRegion;

    if (mobileTab === 'saved') {
      return favorites.includes(p.id);
    }

    return matchesSearch && matchesCategory && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 flex flex-col items-center justify-center">
      {/* Control bar above phone mockup */}
      <div className="w-full max-w-sm flex items-center justify-between text-white text-xs mb-3 px-2">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Jiji Ghana Mobile App Simulator</span>
        </div>
        <button
          onClick={() => setDeviceMode('desktop')}
          className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-md transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Switch to Web Layout</span>
        </button>
      </div>

      {/* Realistic Smartphone Shell */}
      <div className="w-full max-w-[400px] h-[840px] bg-white rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden flex flex-col relative ring-1 ring-white/10">
        {/* Phone Speaker & Notch */}
        <div className="w-full bg-slate-900 h-6 shrink-0 relative flex items-center justify-between px-6 text-white text-[11px] font-semibold">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
          <div className="flex items-center gap-1">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-xs border border-white/80 p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="bg-[#0f2744] text-white px-4 pt-3 pb-3 shrink-0 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <img
                  src="/godysell_logo_emblem.png"
                  alt="GodySell Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-white">
                  Gody<span className="text-emerald-800">Sell</span>
                </span>
                <span className="text-[9px] font-bold uppercase bg-amber-400 text-slate-900 px-1 py-0.2 rounded">
                  GH
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Location selector */}
              <div className="flex items-center gap-1 text-[11px] bg-white/10 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-amber-300" />
                <select
                  value={selectedRegion || ''}
                  onChange={(e) => setSelectedRegion(e.target.value || null)}
                  className="bg-transparent text-white font-medium text-[11px] focus:outline-none cursor-pointer"
                >
                  <option value="" className="text-slate-900">All Ghana</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r.name} value={r.name} className="text-slate-900">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Avatar */}
              {user && (
                <button
                  type="button"
                  onClick={() => setShowUserSheet(true)}
                  className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-emerald-400 shrink-0"
                  title="My Google Account"
                >
                  <img
                    src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Search bar inside mobile header */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search in GodySell Ghana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-white rounded-lg focus:outline-none placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          {mobileTab === 'hub' ? (
            <div className="p-3">
              <ManagementDashboard />
            </div>
          ) : mobileTab === 'chat' ? (
            <div className="p-2 h-full flex-1 flex flex-col">
              <BuyerSellerChatHub isMobileLayout={true} />
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* Category Horizontal Scroll Bubbles */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    selectedCategory === null
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  All
                </button>
                {CATEGORIES_WITH_META.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      selectedCategory === c.name
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {c.name.split('&')[0]}
                  </button>
                ))}
              </div>

              {/* Title / Section status */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                <span>
                  {mobileTab === 'saved' ? `Saved Listings (${displayProducts.length})` : `Recent Ads (${displayProducts.length})`}
                </span>
                <span className="text-[11px] text-emerald-800">Accra &amp; Nationwide</span>
              </div>

              {/* 2-Column Mobile Feed Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {displayProducts.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No ads found in this selection.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <div className="bg-white border-t border-slate-200 h-16 grid grid-cols-5 items-center px-1 shrink-0 z-20">
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              mobileTab === 'home' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Explore</span>
          </button>

          <button
            onClick={() => setMobileTab('saved')}
            className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
              mobileTab === 'saved' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Saved</span>
            {favorites.length > 0 && (
              <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Center Sell Button */}
          <button
            onClick={() => openCreateProductModal()}
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-95">
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-0.5">Sell</span>
          </button>

          <button
            onClick={() => setMobileTab('chat')}
            className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
              mobileTab === 'chat' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Chats</span>
            {totalUnreadChatCount > 0 && (
              <span className="absolute top-1 right-2.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {totalUnreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileTab('hub')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              mobileTab === 'hub' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Seller Hub</span>
          </button>
        </div>

        {/* Mobile User Profile Sheet */}
        {showUserSheet && user && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 bg-slate-200"
                    />
                    <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-xs border border-slate-200 cursor-pointer text-slate-600 hover:text-emerald-700">
                      <Camera className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const r = new FileReader();
                            r.onload = (evt) => {
                              if (evt.target?.result) {
                                updateUserProfile({ picture: evt.target.result as string });
                              }
                            };
                            r.readAsDataURL(f);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                      <UserCheck className="w-3 h-3" />
                      <span>Google Verified</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserSheet(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <button
                  onClick={() => {
                    setMobileTab('hub');
                    setShowUserSheet(false);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl flex items-center justify-between"
                >
                  <span>Open Seller Hub</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">Manage</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserSheet(false);
                  }}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Google</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
