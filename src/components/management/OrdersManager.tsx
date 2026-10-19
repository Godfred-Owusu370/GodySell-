import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PackageCheck,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Check
} from 'lucide-react';
import { Order } from '../../types';

export const OrdersManager: React.FC = () => {
  const {
    myOrders,
    updateOrderStatus,
    myInquiries,
    markInquiryRead,
    openRecordSaleModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries'>('orders');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [repliedMap, setRepliedMap] = useState<Record<string, boolean>>({});

  const handleSendReply = (inquiryId: string) => {
    setRepliedMap((prev) => ({ ...prev, [inquiryId]: true }));
    markInquiryRead(inquiryId);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'orders'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Customer Orders ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'inquiries'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Buyer Inquiries &amp; Offers ({myInquiries.length})</span>
            {myInquiries.filter((i) => i.unread).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        <button
          onClick={openRecordSaleModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Orders Tab View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Item</th>
                  <th className="py-3 px-3">Buyer &amp; Contact</th>
                  <th className="py-3 px-3">Delivery Location</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No customer orders yet for your published listings.
                    </td>
                  </tr>
                ) : (
                  myOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID and Product */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-400 font-bold text-[11px] block">
                        {order.id}
                      </span>
                      <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs mt-0.5">
                        {order.productTitle}
                      </p>
                      <span className="text-[10px] text-slate-400">Qty: {order.quantity} · {order.date}</span>
                    </td>

                    {/* Buyer */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{order.buyerName}</p>
                      <a
                        href={`tel:${order.buyerPhone}`}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.buyerPhone}</span>
                      </a>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{order.buyerLocation}</span>
                      </div>
                    </td>

                    {/* Total Amount in GH₵ */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 tabular-nums">
                        GH₵ {order.totalAmount.toLocaleString()}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      {order.paymentMethod}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Action Status Changer */}
                    <td className="py-3 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiries Tab View */}
      {activeTab === 'inquiries' && (
        <div className="space-y-3">
          {myInquiries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              No inquiries or offers yet. Inquiries from buyers on your listings will appear here in real-time.
            </div>
          ) : (
            myInquiries.map((inq) => {
              const isReplied = repliedMap[inq.id];

              return (
                <div
                  key={inq.id}
                  className={`bg-white p-4 rounded-xl border transition-all ${
                    inq.unread ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{inq.senderName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{inq.senderPhone}</span>
                        <span className="text-[10px] text-slate-400">· {inq.timestamp}</span>
                        {inq.unread && (
                          <span className="bg-rose-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                            New Lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Product: <strong className="text-slate-700">{inq.productTitle}</strong>
                      </p>
                    </div>

                    {inq.offeredPrice && (
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-amber-800 uppercase block">
                          Buyer Offer
                        </span>
                        <span className="font-extrabold text-emerald-800 text-sm tabular-nums">
                          GH₵ {inq.offeredPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    &ldquo;{inq.message}&rdquo;
                  </p>

                  {/* Reply Input Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                    {isReplied ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Reply sent via SMS / Chat to {inq.senderPhone}</span>
                      </span>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Type quick reply to buyer (e.g. Price accepted, let's meet at Accra Mall)..."
                          value={replyTextMap[inq.id] || ''}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({ ...prev, [inq.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                        />
                        <button
                          onClick={() => handleSendReply(inq.id)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Reply</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
