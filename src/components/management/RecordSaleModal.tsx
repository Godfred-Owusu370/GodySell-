import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';

export const RecordSaleModal: React.FC = () => {
  const {
    isRecordSaleModalOpen,
    closeRecordSaleModal,
    myProducts,
    recordSale
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(myProducts[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('Accra Central');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Cash on Delivery');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isRecordSaleModalOpen) return null;

  const currentProduct = myProducts.find((p) => p.id === selectedProductId) || myProducts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const qty = parseInt(quantity) || 1;
    if (qty > currentProduct.stock) {
      setErrorMsg(`Cannot sell ${qty} units. Only ${currentProduct.stock} units in stock!`);
      return;
    }

    const ok = recordSale({
      productId: currentProduct.id,
      quantity: qty,
      buyerName: buyerName || 'Direct Walk-in Buyer',
      buyerPhone: buyerPhone || '+233 24 000 0000',
      buyerLocation: buyerLocation || 'Ghana',
      paymentMethod
    });

    if (ok) {
      setSuccess(true);
      setErrorMsg('');
      setTimeout(() => {
        setSuccess(false);
        closeRecordSaleModal();
      }, 1500);
    } else {
      setErrorMsg('Failed to record sale. Check stock availability.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Record Real-Time Sale</h3>
          </div>
          <button
            onClick={closeRecordSaleModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Sale Successfully Recorded!</h4>
            <p className="text-xs text-slate-600">
              Inventory reduced and revenue added to real-time sales performance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            {/* Select Product */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Product from Inventory
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
              >
                {myProducts.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.title.slice(0, 35)}... (GH₵ {p.price.toLocaleString()}) — {p.stock} in stock
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity Sold</label>
                <input
                  type="number"
                  min="1"
                  max={currentProduct?.stock || 1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calculated Total</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-800 tabular-nums">
                  GH₵ {((currentProduct?.price || 0) * (parseInt(quantity) || 1)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Customer / Buyer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Yaw Poku"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Buyer Phone</label>
                  <input
                    type="tel"
                    placeholder="+233(0)592836664"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                  >
                    <option value="Mobile Money (MTN/Telecel)">MTN / Telecel MoMo</option>
                    <option value="Cash on Delivery">Cash (In-person)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Osu Oxford Street"
                  value={buyerLocation}
                  onChange={(e) => setBuyerLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Confirm Sale &amp; Decrement Stock
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
