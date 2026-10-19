import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Tag,
  Phone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  ArrowLeft,
  Store,
  User,
  Check,
  Truck,
  CreditCard,
  MapPin,
  Lock,
  ShoppingBag,
  Trash2
} from 'lucide-react';

interface BuyerSellerChatHubProps {
  isMobileLayout?: boolean;
}

export const BuyerSellerChatHub: React.FC<BuyerSellerChatHubProps> = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    replyAsSeller,
    deleteConversation,
    deleteMessage,
    clearAllConversations,
    setSelectedProduct,
    setActiveView,
    products,
    user,
    chatRole,
    setChatRole
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  const [confirmDeleteActive, setConfirmDeleteActive] = useState<boolean>(false);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Selected conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !offerPrice) return;

    if (activeConversation) {
      if (chatRole === 'seller') {
        replyAsSeller(activeConversation.id, inputText.trim());
      } else {
        const numOffer = offerPrice ? parseFloat(offerPrice) : undefined;
        sendMessage(activeConversation.id, inputText.trim(), numOffer);
      }
      setInputText('');
      setOfferPrice('');
      setShowOfferInput(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!activeConversation) return;
    if (chatRole === 'seller') {
      replyAsSeller(activeConversation.id, prompt);
    } else {
      sendMessage(activeConversation.id, prompt);
    }
  };

  const formatGHS = (val: number) => {
    return `GH₵ ${val.toLocaleString()}`;
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (c) =>
      c.sellerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.productTitle.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Offers in current conversation
  const latestOffer = activeConversation?.messages
    .slice()
    .reverse()
    .find((m) => m.isOffer && m.offeredPrice);

  return (
    <div className="w-full max-w-full overflow-hidden min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex h-[calc(100dvh-180px)] sm:h-[660px] md:h-[720px] mx-auto">
      {/* LEFT: Conversation Threads List */}
      <div
        className={`border-r border-slate-200 flex flex-col bg-slate-50/60 overflow-hidden min-w-0 ${
          activeConversationId ? 'hidden md:flex' : 'flex w-full'
        } md:w-80 lg:w-96 shrink-0`}
      >
        {/* List Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-900 text-sm">Chats &amp; Enquiries</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {conversations.length} active
              </span>
              {conversations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Clear all chats"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Account Privacy Lock Indicator */}
          <div className="mb-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 truncate">
              <Lock className="w-3 h-3 text-emerald-800 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[9px] shrink-0">
              Private Inbox
            </span>
          </div>

          {/* Clear All Confirmation Banner */}
          {confirmClearAll && (
            <div className="mb-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
              <div className="flex items-start justify-between gap-1">
                <p className="font-bold text-rose-900">Clear all {conversations.length} chats?</p>
              </div>
              <p className="text-[11px] text-rose-700">This removes all chat histories from your inbox.</p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllConversations();
                    setConfirmClearAll(false);
                  }}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Search conversations */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search seller or item..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800 placeholder-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800">Your Private Inbox is Clean</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chats are confidential and only accessible when signed into <span className="font-semibold text-slate-700">{user?.email}</span>. No other user can see your inquiries.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('marketplace')}
                className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline block mx-auto"
              >
                Browse Marketplace &amp; Inquire
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversation?.id;
              const isDeleting = deletingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`w-full transition-colors relative min-w-0 border-b border-slate-100 last:border-b-0 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-800' : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  {isDeleting ? (
                    <div className="p-3 bg-rose-50 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-rose-900">Delete this chat?</p>
                        <p className="text-[10px] text-rose-700 truncate">{conv.sellerName} · {conv.productTitle}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingConvId(null);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                            setDeletingConvId(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveConversationId(conv.id)}
                      className="p-3 flex items-start gap-2.5 cursor-pointer group"
                    >
                      {/* Product thumbnail */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={conv.productImage}
                          alt={conv.productTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Conv Details */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                            {conv.sellerName}
                            {conv.sellerVerified && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-800 shrink-0" />
                            )}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {conv.lastMessageTime}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingConvId(conv.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] font-medium text-slate-700 truncate mb-0.5">
                          {conv.productTitle}
                        </p>

                        <div className="text-[11px] text-slate-500 truncate flex items-center justify-between">
                          <span className="truncate">{conv.lastMessage}</span>
                          {conv.unreadCount > 0 && (
                            <span className="ml-1.5 w-4 h-4 bg-emerald-800 text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Active Chat View (Strictly contained so no text is cut off) */}
      {activeConversation ? (
        <div
          className={`flex-1 min-w-0 w-full max-w-full flex flex-col overflow-hidden bg-slate-50/30 ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Active Product & Seller Header */}
          <div className="p-2.5 sm:p-3.5 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between gap-2 min-w-0 w-full overflow-hidden shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              {/* Mobile Back Button */}
              <button
                onClick={() => setActiveConversationId(null)}
                className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
                title="Back to conversation list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={activeConversation.productImage}
                  alt={activeConversation.productTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {activeConversation.productTitle}
                </h3>
                <div className="flex items-center gap-1.5 text-xs truncate">
                  <span className="font-black text-emerald-800 shrink-0">
                    {formatGHS(activeConversation.productPrice)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold truncate flex items-center gap-1">
                    <Store className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{activeConversation.sellerName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Call, View Ad & Delete actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={`tel:${activeConversation.sellerPhone}`}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200 text-xs font-semibold flex items-center gap-1"
                title={`Call ${activeConversation.sellerPhone}`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Call</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const prod = products.find((p) => p.id === activeConversation.productId);
                  if (prod) setSelectedProduct(prod);
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="View full product specification"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Ad</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmDeleteActive(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Delete this chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Delete Active Conversation Banner Confirmation */}
          {confirmDeleteActive && (
            <div className="bg-rose-50 border-b border-rose-200 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-bold text-rose-900 block">Delete this entire chat?</span>
                <span className="text-[11px] text-rose-700">All message history with {activeConversation.sellerName} will be removed.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteActive(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConversation(activeConversation.id);
                    setConfirmDeleteActive(false);
                  }}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Delete Chat
                </button>
              </div>
            </div>
          )}

          {/* Ghanaian Marketplace Safety Tip Banner */}
          <div className="bg-amber-50/90 px-3 py-1.5 border-b border-amber-100 text-[10px] text-amber-900 flex items-center justify-between gap-2 w-full overflow-hidden shrink-0">
            <span className="truncate flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Safety Tip: Meet in public places or inspect before paying.</span>
            </span>
            <span className="font-bold text-amber-700 shrink-0">Verified</span>
          </div>

          {/* Account Privacy Assurance Banner */}
          <div className="bg-emerald-50/70 px-3 py-1 border-b border-emerald-100 text-[10px] text-emerald-900 flex items-center justify-between gap-2 w-full overflow-hidden shrink-0">
            <span className="truncate flex items-center gap-1 font-semibold text-emerald-800">
              <Lock className="w-3 h-3 text-emerald-800 shrink-0" />
              <span className="truncate">Private Account Chat: Locked to {user?.email}</span>
            </span>
            <span className="font-bold text-emerald-700 shrink-0 text-[9px] uppercase tracking-wide">
              Protected
            </span>
          </div>

          {/* Pending Offer Banner for Seller Decision */}
          {latestOffer && latestOffer.offeredPrice && (
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-b border-amber-200/80 px-3 py-2 flex items-center justify-between gap-2 overflow-hidden shrink-0">
              <div className="min-w-0 flex-1 truncate">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Buyer Price Offer</span>
                <span className="text-xs font-black text-emerald-800 truncate">
                  GH₵ {latestOffer.offeredPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    replyAsSeller(
                      activeConversation.id,
                      `Akwaaba! I accept your offer of GH₵ ${latestOffer.offeredPrice?.toLocaleString()} for the ${activeConversation.productTitle}. You can pay Cash on Delivery or via MTN MoMo upon physical inspection. What is your delivery location?`
                    );
                  }}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-black rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept as Seller</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatRole('seller');
                    setShowOfferInput(true);
                  }}
                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg transition-colors"
                >
                  Counter
                </button>
              </div>
            </div>
          )}

          {/* Messages Stream - strictly bounded with word-break so no cutoffs occur */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 w-full min-w-0 max-w-full">
            {activeConversation.messages.map((msg) => {
              const isBuyer = msg.sender === 'buyer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full group ${isBuyer ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 shadow-xs text-xs break-words [overflow-wrap:anywhere] ${
                      isBuyer
                        ? 'bg-emerald-800 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {/* Offer Highlight Tag */}
                    {msg.isOffer && msg.offeredPrice && (
                      <div
                        className={`mb-1.5 px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 ${
                          isBuyer ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        <Tag className="w-3 h-3 shrink-0" />
                        <span className="truncate">Price Offer: {formatGHS(msg.offeredPrice)}</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {msg.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-medium">
                    <span>
                      {isBuyer
                        ? user?.name ? user.name.split(' ')[0] : 'You'
                        : activeConversation.sellerName}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => deleteMessage(activeConversation.id, msg.id)}
                      className="opacity-60 hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5 rounded ml-1"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Enquiries / Quick Seller Responses (Based on current persona) */}
          <div className="px-3 pt-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full min-w-0 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              {chatRole === 'seller' ? 'Seller Quick:' : 'Quick:'}
            </span>

            {chatRole === 'seller' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Hello! Yes, the item is 100% available and in top shape at our shop showroom.'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Item is available
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'We offer nationwide dispatch via VIP/OA transport or doorstep dispatch in Accra & Kumasi!'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Delivery available
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Feel free to call or WhatsApp me directly at ' + activeConversation.sellerPhone + ' to finalize.'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Call or WhatsApp me
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt('Hello, is this item still available for inspection?')
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Still available?
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt('What is your last price for cash payment today?')
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Last price?
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt('Where is your shop or pickup location in town?')
                  }
                  className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full transition-colors whitespace-nowrap"
                >
                  Location?
                </button>
              </>
            )}
          </div>

          {/* Negotiate Offer Input Tray (if expanded) */}
          {showOfferInput && (
            <div className="p-3 bg-amber-50/70 border-t border-amber-100 flex items-center gap-2 overflow-hidden shrink-0">
              <Tag className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-amber-900 shrink-0">
                {chatRole === 'seller' ? 'Offer Price (GH₵):' : 'Propose Offer (GH₵):'}
              </span>
              <input
                type="number"
                placeholder={activeConversation.productPrice.toString()}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-32 px-3 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowOfferInput(false)}
                className="text-xs text-slate-500 hover:text-slate-800 ml-auto"
              >
                Close
              </button>
            </div>
          )}

          {/* Sender Role Switcher & Message Input Bar */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0">
            {/* Persona Switcher Tab */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setChatRole('buyer')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    chatRole === 'buyer'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <User className="w-3 h-3 text-emerald-800" />
                  <span>Reply as Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatRole('seller')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    chatRole === 'seller'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Store className="w-3 h-3 text-emerald-800" />
                  <span>Reply as Seller ({activeConversation.sellerName.split(' ')[0]})</span>
                </button>
              </div>

              {!showOfferInput && (
                <button
                  type="button"
                  onClick={() => setShowOfferInput(true)}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-amber-50 transition-colors shrink-0"
                >
                  <Tag className="w-3 h-3" />
                  <span>{chatRole === 'seller' ? 'Counter Offer' : 'Make Offer'}</span>
                </button>
              )}
            </div>

            {/* Input & Send Button */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  chatRole === 'seller'
                    ? `Reply to customer from ${activeConversation.sellerName}...`
                    : `Message ${activeConversation.sellerName}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800 placeholder-slate-400 font-medium"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !offerPrice}
                className="p-2 sm:p-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-sm bg-slate-50/40">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-3 border border-slate-200">
            <Lock className="w-7 h-7" />
          </div>
          <p className="font-extrabold text-slate-900 text-sm">Account-Protected Chatbox</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            Your conversations are isolated and private to <span className="font-bold text-slate-700">{user?.email}</span>. No one else logging into this device can see your messages.
          </p>
          <button
            type="button"
            onClick={() => setActiveView('marketplace')}
            className="mt-4 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Browse Marketplace &amp; Message Sellers</span>
          </button>
        </div>
      )}
    </div>
  );
};
