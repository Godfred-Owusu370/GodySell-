import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Tag, CheckCircle2 } from 'lucide-react';

export const BuyerChatModal: React.FC = () => {
  const {
    chatProduct,
    isChatModalOpen,
    closeChatModal,
    addInquiry,
    startOrOpenChatForProduct,
    setSelectedProduct,
    setActiveView,
    user
  } = useApp();
  const [message, setMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '+233(0)592836664');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isChatModalOpen || !chatProduct) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !offerPrice) return;

    const numericOffer = offerPrice ? parseFloat(offerPrice) : undefined;
    const msgText = message.trim() || (numericOffer ? `Hello! I would like to negotiate the price and propose an offer of GH₵ ${numericOffer.toLocaleString()} for ${chatProduct.title}.` : `Hello, is this ${chatProduct.title} still available in ${chatProduct.city}?`);

    // Add to seller dashboard inquiries
    addInquiry({
      productId: chatProduct.id,
      productTitle: chatProduct.title,
      senderName: senderName || user?.name || 'Ghana Buyer',
      senderPhone: senderPhone || user?.phone || '+233 24 000 1122',
      message: msgText,
      offeredPrice: numericOffer
    });

    // Link directly to the live Chats hub
    startOrOpenChatForProduct(chatProduct, msgText, numericOffer);

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessage('');
      setOfferPrice('');
      closeChatModal();
      setSelectedProduct(null);
      setActiveView('chats');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              {chatProduct.sellerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {chatProduct.sellerName}
              </h3>
              <p className="text-xs text-slate-500">
                Inquiry for: <span className="font-semibold text-slate-700">{chatProduct.title.slice(0, 30)}...</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeChatModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Message &amp; Offer Sent!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your inquiry has been delivered directly to the seller&apos;s management dashboard and SMS inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 space-y-4">
            {/* Ad summary strip */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={chatProduct.images[0]}
                alt=""
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{chatProduct.title}</p>
                <p className="text-xs font-bold text-emerald-800">
                  GH₵ {chatProduct.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Offer Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Make a Price Offer (Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  GH₵
                </span>
                <input
                  type="number"
                  placeholder={`e.g. ${Math.round(chatProduct.price * 0.9)}`}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full pl-12 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>
            </div>

            {/* Sender contact fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nana Yaw"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+233(0)592836664"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Your Message</label>
              <textarea
                rows={3}
                required
                placeholder="Ask about availability, delivery options, or inspection time..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Is this still available?',
                'Can we inspect in East Legon?',
                'Last price please?'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setMessage(chip)}
                  className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message to Seller</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
