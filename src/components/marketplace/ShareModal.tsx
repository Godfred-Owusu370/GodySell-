import React, { useState } from 'react';
import { Product } from '../../types';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Facebook,
  Send,
  Mail,
  Smartphone
} from 'lucide-react';

interface ShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?product=${encodeURIComponent(product.id)}`
    : `https://godysell.com/?product=${encodeURIComponent(product.id)}`;

  const formattedPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(product.price).replace('GHS', 'GH₵');

  const shareTitle = `${product.title} - ${formattedPrice} on GodySell Ghana`;
  const shareMessage = `Check out this listing on GodySell Ghana: "${product.title}" (${formattedPrice}) in ${product.city}, ${product.region}.\n\nView here: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bg: 'bg-[#25D366] hover:bg-[#20ba5a]',
      textColor: 'text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      textColor: 'text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      bg: 'bg-[#229ED9] hover:bg-[#1f8ec3]',
      textColor: 'text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
    },
    {
      name: 'SMS',
      icon: Smartphone,
      bg: 'bg-emerald-700 hover:bg-emerald-800',
      textColor: 'text-white',
      url: `sms:?body=${encodeURIComponent(shareMessage)}`
    },
    {
      name: 'Email',
      icon: Mail,
      bg: 'bg-slate-700 hover:bg-slate-800',
      textColor: 'text-white',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareMessage)}`
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share This Product</h3>
              <p className="text-[11px] text-slate-500">Send to buyers, friends, or social media</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 bg-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-emerald-800 font-bold text-xs">
                GH
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{product.title}</h4>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">{formattedPrice}</p>
              <p className="text-[11px] text-slate-500 truncate">{product.city}, {product.region}</p>
            </div>
          </div>

          {/* Direct Copy Link Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Product Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            {copied && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                <Check className="w-3 h-3" />
                <span>Product link copied successfully!</span>
              </p>
            )}
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Share directly via
            </span>
            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all group ${item.bg} ${item.textColor} shadow-2xs`}
                    title={`Share on ${item.name}`}
                  >
                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium mt-1">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
