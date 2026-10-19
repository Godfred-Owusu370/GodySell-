import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  Share2,
  Bookmark,
  ShoppingBag,
  ExternalLink,
  Info,
  Tag,
  Send,
  Edit2,
  Trash2
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    openChatModal,
    startOrOpenChatForProduct,
    setActiveView,
    addOrder,
    favorites,
    toggleFavorite,
    user,
    isProductOwner,
    openCreateProductModal,
    deleteProduct
  } = useApp();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '+233(0)592836664');
  const [buyerLocation, setBuyerLocation] = useState('Accra, Ghana');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Mobile Money (MTN/Telecel)' | 'Bank Transfer'>('Cash on Delivery');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');

  if (!selectedProduct) return null;

  const handleNegotiateAndChat = (customAmount?: number, customNote?: string) => {
    const finalOffer = customAmount !== undefined ? customAmount : (offerAmount ? parseFloat(offerAmount) : undefined);
    const finalNote = customNote !== undefined ? customNote : offerNote.trim();
    startOrOpenChatForProduct(selectedProduct, finalNote || undefined, finalOffer);
    setSelectedProduct(null);
    setActiveView('chats');
  };

  const isFavorited = favorites.includes(selectedProduct.id);

  const formattedPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(selectedProduct.price).replace('GHS', 'GH₵');

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !buyerLocation) return;

    addOrder({
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.images?.[0] || '',
      buyerName,
      buyerPhone,
      buyerLocation,
      quantity: orderQuantity,
      totalAmount: selectedProduct.price * orderQuantity,
      status: 'pending',
      paymentMethod
    });

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsOrdering(false);
    }, 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${selectedProduct.sellerName}, I am contacting you from GodySell Ghana regarding your listing: "${selectedProduct.title}" (${formattedPrice}). Is it still available?`
    );
    const cleanPhone = selectedProduct.sellerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar with close */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>{selectedProduct.category}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{selectedProduct.subcategory}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(selectedProduct.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorited
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-500 hover:bg-slate-200/60'
              }`}
              title="Save item"
            >
              <Bookmark className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="p-2 text-slate-500 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-2 text-slate-500 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Gallery Column (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedProduct.images[activeImageIdx] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-slate-900'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Specifications */}
              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Key Details &amp; Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                      <div key={key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
                        <span className="text-slate-400 font-medium">{key}</span>
                        <span className="text-slate-800 font-semibold mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase & Seller Column (5 cols) */}
            <div className="md:col-span-5 space-y-5">
              {/* Product Header & Price */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedProduct.city}, {selectedProduct.region}</span>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {selectedProduct.title}
                </h1>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formattedPrice}
                    </span>
                    {selectedProduct.negotiable && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Condition: <strong>{selectedProduct.condition}</strong></span>
                  <span className={`font-semibold ${selectedProduct.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} left)` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Contact Seller & Buy Now */}
              <div className="space-y-2.5">
                {/* If current user is the owner/admin of this listing, show Edit and Delete options */}
                {isProductOwner(selectedProduct) && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                        <span>This is your published listing</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const target = selectedProduct;
                            setSelectedProduct(null);
                            openCreateProductModal(target);
                          }}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title="Delete this listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {confirmDelete && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-rose-700">Remove this item from the shop?</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProduct(selectedProduct.id);
                              setSelectedProduct(null);
                              setConfirmDelete(false);
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reveal Phone */}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>{showPhone ? selectedProduct.sellerPhone : 'Show Contact Phone'}</span>
                </button>

                {/* Chat & Negotiate Price Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isNegotiating) {
                          setIsNegotiating(true);
                        } else {
                          handleNegotiateAndChat();
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
                      title="Open Live Chat or Make Offer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Chat &amp; Negotiate Price</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNegotiating(!isNegotiating)}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                        isNegotiating
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                      }`}
                      title="Propose a counter-offer"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isNegotiating ? 'Close' : 'Offer GH₵'}</span>
                    </button>
                  </div>

                  {/* Expandable Price Negotiation Panel */}
                  {isNegotiating && (
                    <div className="p-3.5 bg-gradient-to-b from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          <span>Propose Your Price Offer</span>
                        </span>
                        <span className="text-[11px] text-amber-700 bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
                          Listed: {formattedPrice}
                        </span>
                      </div>

                      {/* Quick Discount Chip Buttons */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: '-5%', price: Math.round(selectedProduct.price * 0.95) },
                          { label: '-10%', price: Math.round(selectedProduct.price * 0.90) },
                          { label: '-15%', price: Math.round(selectedProduct.price * 0.85) }
                        ].map((discount) => (
                          <button
                            key={discount.label}
                            type="button"
                            onClick={() => {
                              setOfferAmount(discount.price.toString());
                              setOfferNote(`Hello ${selectedProduct.sellerName}, will you accept GH₵ ${discount.price.toLocaleString()} for this ${selectedProduct.title}?`);
                            }}
                            className="py-1 px-1.5 text-center bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-slate-800 transition-colors"
                          >
                            {discount.label} (GH₵ {discount.price.toLocaleString()})
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          GH₵
                        </span>
                        <input
                          type="number"
                          placeholder={`Enter your offer price (e.g. ${Math.round(selectedProduct.price * 0.9)})`}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          className="w-full pl-12 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Optional message (e.g. Ready for instant cash payment today)"
                        value={offerNote}
                        onChange={(e) => setOfferNote(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleNegotiateAndChat()}
                          className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Offer &amp; Open Chats</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            startOrOpenChatForProduct(selectedProduct);
                            setSelectedProduct(null);
                            setActiveView('chats');
                          }}
                          className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Direct Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp button */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {/* Direct Order (Cash on Delivery or MoMo) */}
                {selectedProduct.stock > 0 && !isOrdering && (
                  <button
                    onClick={() => setIsOrdering(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Instant Order (Doorstep Delivery in Ghana)</span>
                  </button>
                )}
              </div>

              {/* Order Drawer/Form if user clicked Instant Order */}
              {isOrdering && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Place Quick Order
                    </span>
                    <button
                      onClick={() => setIsOrdering(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {orderSuccess ? (
                    <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Order received! Seller will call you for delivery.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kwame Mensah"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Phone (MoMo)</label>
                          <input
                            type="tel"
                            required
                            placeholder="+233(0)592836664"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={selectedProduct.stock}
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Delivery Address / Landmark</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. East Legon near A&amp;C Mall, Accra"
                          value={buyerLocation}
                          onChange={(e) => setBuyerLocation(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                        >
                          <option value="Cash on Delivery">Cash on Delivery (Pay upon arrival)</option>
                          <option value="Mobile Money (MTN/Telecel)">Mobile Money (MTN / Telecel MoMo)</option>
                          <option value="Bank Transfer">Bank Transfer (Instant GhIPSS)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors mt-2"
                      >
                        Confirm Order ({new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(selectedProduct.price * orderQuantity).replace('GHS', 'GH₵')})
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Seller Profile Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      {selectedProduct.sellerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {selectedProduct.sellerName}
                        {selectedProduct.verifiedSeller && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Member since {selectedProduct.sellerMemberSince}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Rating: <strong className="text-slate-900">{selectedProduct.sellerRating} / 5.0</strong> ({selectedProduct.sellerReviewCount} reviews)</span>
                  <span className="text-emerald-700 font-medium">Fast Responder</span>
                </div>
              </div>

              {/* GodySell Ghana Safety Tips */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Safety Tips on GodySell Ghana</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                  <li>Do not pay any advance before inspecting the item in person.</li>
                  <li>Meet the seller in a safe, public place (e.g. Accra Mall, Kumasi City Mall).</li>
                  <li>Inspect goods thoroughly to ensure they match description.</li>
                  <li>Pay only after collecting your product.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
