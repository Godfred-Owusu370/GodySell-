import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Package,
  PlusCircle,
  ShoppingBag,
  Megaphone,
  Layers,
  AlertTriangle,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { SalesAnalytics } from './SalesAnalytics';
import { InventoryTable } from './InventoryTable';
import { OrdersManager } from './OrdersManager';
import { AnnouncementManager } from './AnnouncementManager';

export const ManagementDashboard: React.FC = () => {
  const {
    openCreateProductModal,
    openRecordSaleModal,
    myProducts,
    myLowStockCount,
    myOrders,
    myInquiries,
    conversations,
    setChatRole,
    myTotalRevenue,
    setActiveView,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'orders' | 'announcements'>('inventory');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with title, KPIs & quick actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <button
              onClick={() => setActiveView('marketplace')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Seller Management Portal
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Account: {user?.email}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventory &amp; Sales Management System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your published products on GodySell Ghana. Listings published by other sellers cannot be modified here.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          {myProducts.length > 0 && (
            <button
              onClick={openRecordSaleModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Record Sale</span>
            </button>
          )}

          <button
            onClick={() => openCreateProductModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List New Product</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-400" />
          <span>My Inventory &amp; Stock</span>
          <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
            {myProducts.length}
          </span>
          {myLowStockCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
              {myLowStockCount} low
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'sales'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Sales Performance</span>
          <span className="text-[10px] text-emerald-500 font-bold tabular-nums">
            GH₵ {(myTotalRevenue / 1000).toFixed(0)}k
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>My Orders &amp; Inquiries</span>
          <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
            {myOrders.length + myInquiries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'announcements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4 text-emerald-400" />
          <span>Site Promo Banner</span>
        </button>

        <button
          onClick={() => {
            setChatRole('seller');
            setActiveView('chats');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200"
          title="Open Chats and reply directly to buyers as Seller"
        >
          <MessageSquare className="w-4 h-4 text-emerald-800" />
          <span>Buyer Chats &amp; Offers</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
            {conversations.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'inventory' && <InventoryTable />}
      {activeTab === 'sales' && <SalesAnalytics />}
      {activeTab === 'orders' && <OrdersManager />}
      {activeTab === 'announcements' && <AnnouncementManager />}
    </div>
  );
};
