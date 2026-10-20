import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { CategoryBar } from './CategoryBar';
import {
  SlidersHorizontal,
  Package,
  Bookmark,
  ArrowRight
} from 'lucide-react';
import { GHANA_REGIONS } from '../../data/initialProducts';

export const MarketplaceView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    openCreateProductModal,
    setActiveView,
    favorites,
    showOnlySaved,
    setShowOnlySaved
  } = useApp();

  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'newest'>('recommended');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (showOnlySaved && !favorites.includes(p.id)) {
      return false;
    }

    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesRegion = !selectedRegion || p.region === selectedRegion;
    const matchesCondition = conditionFilter === 'all' || p.condition === conditionFilter;
    const matchesPrice = maxPrice === '' || p.price <= maxPrice;
    const isActive = p.status === 'active' || p.status === 'boosted' || !p.status;

    return isActive && matchesSearch && matchesCategory && matchesRegion && matchesCondition && matchesPrice;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (a.status === 'boosted' && b.status !== 'boosted') return -1;
    if (b.status === 'boosted' && a.status !== 'boosted') return 1;
    return b.views - a.views;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Category Navigation Strip */}
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-5">
        {/* Saved Ads Active Banner */}
        {showOnlySaved && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0">
                <Bookmark className="w-4 h-4" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Saved Ads ({filteredProducts.length})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Showing all the listings bookmarked on this device.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOnlySaved(false)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition-colors shrink-0 shadow-2xs"
            >
              View All Ads
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Marketplace</span>
              <span aria-hidden="true">·</span>
              <span>Greater Accra, Ashanti &amp; Nationwide</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
              Buy and sell directly with verified people across Ghana.
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Find phones, vehicles, real estate, electronics, and home essentials. Free listings, direct seller chat, and verified contacts.
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => openCreateProductModal()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
              >
                + Post an Ad
              </button>

              <button
                onClick={() => setActiveView('management')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Manage Inventory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Condition selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="all">All Conditions</option>
                <option value="Brand New">Brand New</option>
                <option value="Foreign Used">Foreign Used</option>
                <option value="Local Used">Local Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>

            {/* Price Cap Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium text-slate-700">Max Price:</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-semibold">
                  GH₵
                </span>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-24 pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Clear filters shortcut */}
            {(selectedCategory || selectedRegion || conditionFilter !== 'all' || maxPrice !== '' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedRegion(null);
                  setConditionFilter('all');
                  setMaxPrice('');
                }}
                className="text-xs text-emerald-800 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort By selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-normal">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="recommended">Featured First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-slate-900 text-sm">
              {selectedCategory || 'Recent Listings'}
              <span className="ml-2 font-normal text-slate-400 text-xs">
                ({sortedProducts.length} items)
              </span>
            </span>

            {selectedRegion && (
              <span className="text-slate-500 text-xs">
                Region: <span className="font-semibold text-slate-800">{selectedRegion}</span>
              </span>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-500" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  No active listings yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Be the first seller to post an item on GodySell Ghana. Listings are free and appear immediately to buyers nationwide.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openCreateProductModal()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  <span>+ Post Your Ad</span>
                </button>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">No listings match your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing selected filters to discover other items.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedRegion(null);
                    setConditionFilter('all');
                    setMaxPrice('');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => openCreateProductModal()}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  + Post New Ad
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
