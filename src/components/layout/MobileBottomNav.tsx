import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Bookmark, PlusCircle, MessageSquare, Layers } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    favorites,
    totalUnreadChatCount,
    openCreateProductModal,
    showOnlySaved,
    setShowOnlySaved
  } = useApp();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around"
    >
      {/* 1. Explore / Shop */}
      <button
        onClick={() => {
          setShowOnlySaved(false);
          setActiveView('marketplace');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
          activeView === 'marketplace' && !showOnlySaved
            ? 'text-emerald-800'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Shop</span>
      </button>

      {/* 2. Saved Favorites */}
      <button
        onClick={() => {
          setShowOnlySaved(true);
          setActiveView('marketplace');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
          activeView === 'marketplace' && showOnlySaved
            ? 'text-emerald-800'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Bookmark className="w-5 h-5" fill={showOnlySaved ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-semibold mt-0.5">Saved</span>
        {favorites.length > 0 && (
          <span className="absolute top-0.5 right-2 min-w-[15px] h-3.5 bg-emerald-800 text-white text-[9px] font-bold rounded-full px-1 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* 3. Center Sell Action */}
      <button
        onClick={() => openCreateProductModal()}
        className="flex flex-col items-center justify-center -mt-4 group"
      >
        <div className="w-11 h-11 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform active:scale-95">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-slate-800 mt-0.5">Sell</span>
      </button>

      {/* 4. Live Chats */}
      <button
        onClick={() => setActiveView('chats')}
        className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
          activeView === 'chats'
            ? 'text-emerald-800'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Chats</span>
        {totalUnreadChatCount > 0 && (
          <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {totalUnreadChatCount}
          </span>
        )}
      </button>

      {/* 5. Seller Hub */}
      <button
        onClick={() => setActiveView('management')}
        className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
          activeView === 'management'
            ? 'text-emerald-800'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">Seller Hub</span>
      </button>
    </nav>
  );
};
