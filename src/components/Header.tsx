import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  Bookmark,
  Search,
  MapPin,
  LogOut,
  UserCheck,
  ChevronDown,
  X
} from 'lucide-react';
import { GHANA_REGIONS } from '../data/initialProducts';
import { GodySellLogo } from './GodySellLogo';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    favorites,
    openCreateProductModal,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    user,
    logout,
    totalUnreadChatCount,
    showOnlySaved,
    setShowOnlySaved
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      {/* Top primary row (Logo, Search on desktop, Region, Navigation, User profile) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => {
              setShowOnlySaved(false);
              setActiveView('marketplace');
            }}
            className="flex items-center focus:outline-none text-left"
          >
            <GodySellLogo size="md" />
          </button>

          {/* Region Selector (Ghana) - Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Regions</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Search input on desktop (md+) */}
        {activeView === 'marketplace' && (
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg items-center relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search listings, categories, or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition-colors placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right side for desktop: Nav links + Sell CTA + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Nav Tabs (Shop, Seller Hub, Chats) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setShowOnlySaved(false);
                setActiveView('marketplace');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'marketplace' && !showOnlySaved
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveView('management')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'management'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller Hub
            </button>
            <button
              onClick={() => setActiveView('chats')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
                activeView === 'chats'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Chats</span>
              {totalUnreadChatCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-bold">
                  {totalUnreadChatCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('about')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'about'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              About
            </button>
          </div>

          {/* Saved Ads Bookmark Button */}
          <button
            onClick={() => {
              setShowOnlySaved(!showOnlySaved);
              setActiveView('marketplace');
            }}
            title={showOnlySaved ? 'Show All Ads' : 'Show Saved Ads'}
            className={`hidden lg:flex relative p-2 rounded-lg transition-colors ${
              showOnlySaved
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={showOnlySaved ? 'currentColor' : 'none'} />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-800 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Desktop Post Ad Button */}
          <button
            onClick={() => openCreateProductModal()}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Ad</span>
          </button>

          {/* Mobile Region Selector */}
          <div className="flex md:hidden items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
            <MapPin className="w-3 h-3 text-slate-400" />
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="bg-transparent border-none text-[11px] font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[75px] truncate"
            >
              <option value="">Ghana</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name.replace('Greater ', '')}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                title={`${user.name} (${user.email})`}
              >
                <img
                  src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs space-y-2">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                          <UserCheck className="w-3 h-3" />
                          <span>Verified Account</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('management');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-between transition-colors"
                      >
                        <span>Seller Management Hub</span>
                        <span className="text-[10px] text-slate-400 font-normal">Active</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('chats');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-between transition-colors"
                      >
                        <span>Messages &amp; Inquiries</span>
                        {totalUnreadChatCount > 0 && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {totalUnreadChatCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-50 font-medium text-rose-600 flex items-center gap-2 transition-colors mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CONTROLS ROW */}
      <div className="md:hidden px-3 pb-2.5 pt-1 space-y-2 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between gap-2">
          {/* Segmented control for mobile: Shop | Hub | Chats */}
          <div className="flex-1 flex items-center bg-slate-100 p-0.5 rounded-lg justify-between">
            <button
              onClick={() => {
                setShowOnlySaved(false);
                setActiveView('marketplace');
              }}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold text-center transition-colors ${
                activeView === 'marketplace' && !showOnlySaved
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Shop
            </button>

            <button
              onClick={() => setActiveView('management')}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold text-center transition-colors ${
                activeView === 'management'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Seller Hub
            </button>

            <button
              onClick={() => setActiveView('chats')}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold text-center transition-colors relative ${
                activeView === 'chats'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Chats
              {totalUnreadChatCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-bold">
                  {totalUnreadChatCount}
                </span>
              )}
            </button>
          </div>

          {/* Sell Button on mobile */}
          <button
            onClick={() => openCreateProductModal()}
            className="flex items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Ad</span>
          </button>
        </div>

        {/* Search bar on mobile */}
        {activeView === 'marketplace' && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search listings in Ghana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
