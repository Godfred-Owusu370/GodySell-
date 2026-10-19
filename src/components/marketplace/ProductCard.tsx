import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { Bookmark, MapPin, Check, PackageCheck, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, favorites, toggleFavorite, deleteProduct, isProductOwner } = useApp();
  const [imageError, setImageError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isFavorited = favorites.includes(product.id);

  // Format currency GH₵ with commas
  const formattedPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(product.price).replace('GHS', 'GH₵');

  return (
    <article
      onClick={() => setSelectedProduct(product)}
      className="group cursor-pointer bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between relative"
    >
      {/* Delete Confirmation Overlay */}
      {confirmDelete && (
        <div
          className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 p-4 flex flex-col items-center justify-center text-center space-y-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-rose-900">Delete this item from the shop?</p>
          <p className="text-[10px] text-slate-500 line-clamp-1">{product.title}</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteProduct(product.id);
                setConfirmDelete(false);
              }}
              className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Media slot */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {!imageError && product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center">
            <PackageCheck className="w-7 h-7 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-500 line-clamp-1">
              {product.title}
            </span>
          </div>
        )}

        {/* Action icons: Save & Delete */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isProductOwner(product) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              aria-label="Delete listing"
              title="Delete this listing from shop"
              className="p-1.5 rounded-full bg-white/85 text-slate-500 hover:text-rose-600 hover:bg-rose-50 backdrop-blur-md shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            aria-label={isFavorited ? 'Remove from saved' : 'Save listing'}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
              isFavorited
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white/85 text-slate-700 hover:bg-white hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Clean status badge */}
        {product.status === 'boosted' && (
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded tracking-wide shadow-2xs">
            Featured
          </div>
        )}

        {product.stock <= 2 && product.stock > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-rose-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Unboxed category and condition breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1 truncate">
            <span>{product.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{product.condition}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Location */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-base font-bold text-slate-900 tabular-nums tracking-tight">
              {formattedPrice}
            </span>
            {product.negotiable && (
              <span className="text-[11px] text-slate-400 font-normal">
                Negotiable
              </span>
            )}
          </div>

          {/* Location and Verification */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-normal">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.city}</span>
            </div>

            {product.verifiedSeller && (
              <div className="flex items-center gap-1 text-emerald-800 shrink-0 text-[11px] font-medium">
                <Check className="w-3 h-3" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
