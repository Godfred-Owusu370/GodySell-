import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Tag,
  Package,
  ShoppingBag
} from 'lucide-react';
import { ProductCategory } from '../../types';
import { CATEGORIES_WITH_META } from '../../data/initialProducts';

export const InventoryTable: React.FC = () => {
  const {
    myProducts,
    updateStock,
    incrementStock,
    toggleProductStatus,
    openCreateProductModal,
    deleteProduct,
    setSelectedProduct,
    setActiveView
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // If the seller has no published products, keep the seller hub blank for them
  if (myProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center border border-slate-200">
          <Package className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Your Seller Inventory is Blank
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven't published any products on GodySell Ghana yet. You can browse, order, and make inquiries for all items on the marketplace, but you can only edit products published by your own account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openCreateProductModal()}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Your First Product</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('marketplace')}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
            <span>Browse Marketplace</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = myProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'in_stock') matchesStatus = p.stock > 3;
    if (statusFilter === 'low_stock') matchesStatus = p.stock > 0 && p.stock <= 3;
    if (statusFilter === 'out_of_stock') matchesStatus = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleBulkRestock = () => {
    // Add 5 units to all of user's products that have low or zero stock
    myProducts.forEach((p) => {
      if (p.stock <= 3) {
        updateStock(p.id, p.stock + 5);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-1 items-center gap-3">
          {/* Search SKU / Title */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product title, SKU, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="hidden md:block px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
          >
            <option value="all">All Categories</option>
            {CATEGORIES_WITH_META.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({myProducts.length})
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'low_stock'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'out_of_stock'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock
            </button>
          </div>

          <button
            onClick={handleBulkRestock}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            title="Add +5 units to all items with <= 3 stock"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Restock Low (+5)</span>
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Item &amp; Details</th>
                <th className="py-3.5 px-3">SKU &amp; Category</th>
                <th className="py-3.5 px-3">Price (GH₵)</th>
                <th className="py-3.5 px-3">Stock Controller</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Performance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No products match current filter</p>
                    <p className="text-[11px]">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 3;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4
                              onClick={() => setSelectedProduct(product)}
                              className="font-bold text-slate-900 truncate hover:text-emerald-800 cursor-pointer"
                              title={product.title}
                            >
                              {product.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {product.city}, {product.region}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-700 font-semibold text-[11px]">
                            {product.sku}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {product.category}
                          </p>
                        </div>
                      </td>

                      {/* Price in GH₵ */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 tabular-nums">
                          GH₵ {product.price.toLocaleString()}
                        </span>
                        {product.negotiable && (
                          <span className="block text-[10px] text-amber-600 font-medium">
                            Negotiable
                          </span>
                        )}
                      </td>

                      {/* Real-time Stock Controller */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => incrementStock(product.id, -1)}
                            disabled={product.stock <= 0}
                            className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
                            title="Decrement stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                            className={`w-14 text-center py-1 font-bold text-xs tabular-nums rounded border focus:outline-none ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : isLowStock
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-emerald-600'
                            }`}
                          />

                          <button
                            onClick={() => incrementStock(product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Increment stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isLowStock && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low stock alert</span>
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="block text-[10px] text-rose-600 font-bold mt-1">
                            Sold Out
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            product.status === 'active' || product.status === 'boosted'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {product.status === 'boosted' ? 'Boosted' : product.status}
                        </button>
                      </td>

                      {/* Performance: Views & Inquiries */}
                      <td className="py-3 px-3 text-right">
                        <div className="text-[11px] text-slate-600 tabular-nums">
                          <div><strong className="text-slate-900">{product.views}</strong> views</div>
                          <div><strong className="text-emerald-700">{product.inquiries}</strong> leads</div>
                          <div><strong className="text-slate-800">{product.salesCount}</strong> sold</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="View ad on marketplace"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openCreateProductModal(product)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded"
                            title="Edit product specs & price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${product.title}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
