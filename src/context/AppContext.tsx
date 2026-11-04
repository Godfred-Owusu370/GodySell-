import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Order,
  Inquiry,
  SiteAnnouncement,
  ViewMode,
  DeviceMode,
  UserProfile,
  Conversation,
  ChatMessage
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_INQUIRIES, INITIAL_ANNOUNCEMENT } from '../data/initialProducts';
import { INITIAL_CONVERSATIONS } from '../data/initialConversations';
import { getEmailProfilePhoto } from '../utils/avatar';
import {
  fetchOnlineProducts,
  publishProductToCloud,
  updateProductInCloud,
  deleteProductFromCloud,
  subscribeToSupabaseProducts
} from '../services/productDatabase';
import {
  syncUserProfileToSupabase,
  fetchUserProfileFromSupabase,
  updateSellerContactAcrossAllProducts,
  upgradeLegacyMemberSinceInDatabase,
  submitUserReportToSupabase,
  submitSupportMessageToSupabase
} from '../services/supabase';
import { formatMemberSinceYear } from '../utils/whatsapp';

interface AppContextType {
  user: UserProfile | null;
  loginWithGoogle: (profile: Partial<UserProfile>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, offerPrice?: number) => void;
  replyAsSeller: (conversationId: string, replyText: string) => void;
  startOrOpenChatForProduct: (product: Product, initialMessage?: string, initialOffer?: number) => string;
  deleteConversation: (conversationId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearAllConversations: () => void;
  totalUnreadChatCount: number;
  isTypingByConv: Record<string, boolean>;
  chatRole: 'buyer' | 'seller';
  setChatRole: (role: 'buyer' | 'seller') => void;
  showOnlySaved: boolean;
  setShowOnlySaved: (show: boolean) => void;
  favorites: string[];
  activeView: ViewMode;
  deviceMode: DeviceMode;
  announcement: SiteAnnouncement;
  selectedCategory: string | null;
  selectedRegion: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  isCreateProductModalOpen: boolean;
  isRecordSaleModalOpen: boolean;
  isChatModalOpen: boolean;
  chatProduct: Product | null;
  editingProduct: Product | null;
  isSyncing: boolean;
  syncError: string | null;
  refreshProducts: () => Promise<void>;
  
  // Actions
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setSelectedProduct: (prod: Product | null) => void;
  toggleFavorite: (productId: string) => void;
  setActiveView: (view: ViewMode) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  addProduct: (product: Omit<Product, 'id' | 'views' | 'inquiries' | 'salesCount' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, newStock: number) => void;
  incrementStock: (id: string, delta: number) => void;
  toggleProductStatus: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'timestamp' | 'unread'>) => void;
  markInquiryRead: (id: string) => void;
  updateAnnouncement: (announcement: SiteAnnouncement) => void;
  recordSale: (params: {
    productId: string;
    quantity: number;
    buyerName: string;
    buyerPhone: string;
    buyerLocation: string;
    paymentMethod: Order['paymentMethod'];
  }) => boolean;
  openCreateProductModal: (prodToEdit?: Product) => void;
  closeCreateProductModal: () => void;
  openRecordSaleModal: () => void;
  closeRecordSaleModal: () => void;
  openChatModal: (product: Product) => void;
  closeChatModal: () => void;

  // Calculated Sales & Inventory KPIs
  totalRevenue: number;
  totalUnitsSold: number;
  activeListingsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalViews: number;

  // Account-Specific Seller Hub properties
  myProducts: Product[];
  myOrders: Order[];
  myInquiries: Inquiry[];
  myTotalRevenue: number;
  myUnitsSold: number;
  myActiveListingsCount: number;
  myLowStockCount: number;
  myOutOfStockCount: number;
  isProductOwner: (productOrId: Product | string) => boolean;
  submitReport: (report: { reportedProductId?: string; reportedSellerEmail?: string; reporterEmail?: string; reason: string; details?: string; }) => Promise<boolean>;
  submitSupportMessage: (support: { userName: string; userEmail: string; userPhone?: string; subject: string; message: string; }) => Promise<boolean>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Profile from Google Sign-In
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedStr = localStorage.getItem('godysell_user');
      if (savedStr) {
        const saved: UserProfile = JSON.parse(savedStr);
        // If the stored picture was a generic unsplash stock photo, update it to their own email picture
        if (!saved.picture || saved.picture.includes('unsplash.com')) {
          saved.picture = getEmailProfilePhoto(saved.email);
        }
        // Upgrade all logged in users to 2026 per platform standard
        saved.memberSince = '2026';
        localStorage.setItem('godysell_user', JSON.stringify(saved));
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const loginWithGoogle = (profile: Partial<UserProfile>) => {
    const rawEmail = profile.email?.trim().toLowerCase() || '';
    if (!rawEmail) return;

    const email = rawEmail;
    const autoName = email.split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Google User';

    const resolvedName = profile.name?.trim() || autoName;
    const resolvedPicture = profile.picture || getEmailProfilePhoto(email);

    // Standardize membership year to 2026
    const resolvedMemberSince = '2026';
    const resolvedPhone = profile.phone ? profile.phone.trim() : '';

    const newUser: UserProfile = {
      id: profile.id || `usr-${Date.now().toString().slice(-4)}`,
      name: resolvedName,
      email: email,
      picture: resolvedPicture,
      phone: resolvedPhone,
      region: profile.region || 'Greater Accra',
      isVerified: true,
      memberSince: resolvedMemberSince
    };
    setUser(newUser);
    try {
      localStorage.setItem('godysell_user', JSON.stringify(newUser));
      syncUserProfileToSupabase(newUser).catch(() => {});
      // Asynchronously fetch latest saved profile from Supabase to hydrate phone
      fetchUserProfileFromSupabase(email).then((supaProfile) => {
        if (supaProfile) {
          setUser((curr) => {
            if (!curr || curr.email.toLowerCase() !== email.toLowerCase()) return curr;
            const updatedProfile: UserProfile = {
              ...curr,
              phone: supaProfile.phone !== undefined && supaProfile.phone !== '' ? supaProfile.phone : curr.phone,
              name: supaProfile.name || curr.name,
              memberSince: '2026',
              region: supaProfile.region || curr.region
            };
            localStorage.setItem('godysell_user', JSON.stringify(updatedProfile));
            return updatedProfile;
          });
        }
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('godysell_user', JSON.stringify(updated));
        syncUserProfileToSupabase(updated).catch(() => {});

        // If phone or name was updated, reflect across all products published by this seller in Supabase and state
        if (updates.phone !== undefined || updates.name !== undefined) {
          const finalPhone = updates.phone !== undefined ? updates.phone : (prev.phone || '');
          const finalName = updates.name !== undefined ? updates.name : prev.name;
          updateSellerContactAcrossAllProducts(prev.email, finalPhone, finalName).catch(() => {});
          setProducts((currentProducts) =>
            currentProducts.map((p) => {
              if (p.sellerEmail?.trim().toLowerCase() === prev.email.trim().toLowerCase()) {
                return {
                  ...p,
                  sellerPhone: finalPhone,
                  sellerName: finalName
                };
              }
              return p;
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
    try {
      localStorage.removeItem('godysell_user');
    } catch (e) {
      console.error(e);
    }
  };

  const DEFAULT_PRODUCT_IDS = new Set([
    'prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006', 'prod-007', 'prod-008'
  ]);

  const isDemoOrTestProduct = (p: any): boolean => {
    if (!p) return true;
    const id = String(p.id || '');
    const title = String(p.title || '').trim().toLowerCase();
    if (id.startsWith('prod-test-') || id.startsWith('prod-00') || DEFAULT_PRODUCT_IDS.has(id)) {
      return true;
    }
    if (title.startsWith('test product') || title === 'sample product' || title.includes('sample listing')) {
      return true;
    }
    return false;
  };

  // Products - initialized from shared cloud cache or initial state (genuine user products only)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('godysell_shared_products_cache');
      if (cached) {
        const parsed: Product[] = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const genuine = parsed.filter((p) => !isDemoOrTestProduct(p));
          if (genuine.length > 0) return genuine;
        }
      }
      const saved = localStorage.getItem('jiji_gh_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const genuine = parsed.filter((p) => !isDemoOrTestProduct(p));
          if (genuine.length > 0) return genuine;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS.filter((p) => !isDemoOrTestProduct(p));
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('jiji_gh_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.filter((o) => !DEFAULT_PRODUCT_IDS.has(o.productId) && !o.productId.startsWith('prod-00'));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  // Inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem('jiji_gh_inquiries');
      if (saved) {
        const parsed: Inquiry[] = JSON.parse(saved);
        return parsed.filter((inq) => !DEFAULT_PRODUCT_IDS.has(inq.productId) && !inq.productId.startsWith('prod-00'));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INQUIRIES;
  });

  // Private, Account-Isolated Buyer-Seller Conversations
  const loadAccountConversations = (userEmail?: string | null): Conversation[] => {
    if (!userEmail) return [];
    const normalizedEmail = userEmail.trim().toLowerCase();
    const key = `godysell_private_convs_${normalizedEmail}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        return parsed.filter(
          (c) =>
            (c.buyerEmail && c.buyerEmail.toLowerCase() === normalizedEmail) ||
            (c.sellerEmail && c.sellerEmail.toLowerCase() === normalizedEmail)
        );
      }

      // If Godfred Owusu's account, seed with initial conversations
      if (normalizedEmail === 'godfredowusu370@gmail.com') {
        const seeded = INITIAL_CONVERSATIONS.map((c) => ({
          ...c,
          buyerEmail: 'godfredowusu370@gmail.com'
        }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
    } catch (e) {
      console.error(e);
    }
    // Any friend or new account starts with zero conversations (clean private inbox)
    return [];
  };

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return loadAccountConversations(user?.email);
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const initialList = loadAccountConversations(user?.email);
    return initialList[0]?.id || null;
  });

  // Switch conversation inbox whenever the logged-in user changes
  useEffect(() => {
    if (user?.email) {
      const userConvs = loadAccountConversations(user.email);
      setConversations(userConvs);
      setActiveConversationId(userConvs[0]?.id || null);
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [user?.email]);

  // Persist conversations exclusively to the current user's private store
  useEffect(() => {
    if (user?.email) {
      const key = `godysell_private_convs_${user.email.trim().toLowerCase()}`;
      try {
        localStorage.setItem(key, JSON.stringify(conversations));
      } catch (e) {
        console.error(e);
      }
    }
  }, [conversations, user?.email]);

  const [isTypingByConv, setIsTypingByConv] = useState<Record<string, boolean>>({});
  const [chatRole, setChatRole] = useState<'buyer' | 'seller'>('buyer');
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);

  const totalUnreadChatCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const replyAsSeller = (conversationId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sellerMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'seller',
      text: replyText.trim(),
      timestamp: timeStr
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, sellerMsg],
            lastMessage: replyText.trim(),
            lastMessageTime: 'Just now'
          };
        }
        return c;
      })
    );
  };

  const sendMessage = (conversationId: string, text: string, offerPrice?: number) => {
    if (!text.trim() && !offerPrice) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSendingAsSeller = chatRole === 'seller';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isSendingAsSeller ? 'seller' : 'buyer',
      text: text.trim(),
      timestamp: timeStr,
      offeredPrice: offerPrice,
      isOffer: Boolean(offerPrice)
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: offerPrice ? `Offer: GH₵ ${offerPrice.toLocaleString()} - ${text}` : text,
            lastMessageTime: 'Just now',
            unreadCount: isSendingAsSeller ? 0 : c.unreadCount + 1
          };
        }
        return c;
      })
    );
  };

  const startOrOpenChatForProduct = (product: Product, initialMessage?: string, initialOffer?: number): string => {
    const currentEmail = user?.email?.trim().toLowerCase() || 'user@example.com';
    const currentName = user?.name || 'Customer';

    // Check if conversation already exists for this product in current account
    const existing = conversations.find(
      (c) => c.productId === product.id && (!c.buyerEmail || c.buyerEmail.toLowerCase() === currentEmail)
    );
    if (existing) {
      setActiveConversationId(existing.id);
      if (initialMessage && initialMessage.trim()) {
        sendMessage(existing.id, initialMessage, initialOffer);
      } else if (initialOffer) {
        sendMessage(existing.id, `Hello! I would like to negotiate the price and propose an offer of GH₵ ${initialOffer.toLocaleString()}.`, initialOffer);
      }
      return existing.id;
    }

    // Create a new conversation private to this user
    const newConvId = `conv-${Date.now().toString().slice(-4)}`;
    const msgText = initialMessage?.trim() || (initialOffer
      ? `Hello! I would like to negotiate the price and make an offer of GH₵ ${initialOffer.toLocaleString()} for this ${product.title}.`
      : `Hello, is this ${product.title} still available in ${product.city}?`);

    const initialMsgObj: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'buyer',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offeredPrice: initialOffer,
      isOffer: Boolean(initialOffer)
    };

    const newConv: Conversation = {
      id: newConvId,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
      sellerName: product.sellerName,
      sellerPhone: product.sellerPhone,
      sellerRating: product.sellerRating,
      sellerVerified: product.verifiedSeller,
      buyerName: currentName,
      buyerEmail: currentEmail,
      sellerEmail: product.sellerEmail || 'vendor@godysell.com',
      lastMessage: initialMsgObj.text,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [initialMsgObj]
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    return newConvId;
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      if (user?.email) {
        const key = `godysell_private_convs_${user.email.trim().toLowerCase()}`;
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== conversationId) return c;
        const remaining = c.messages.filter((m) => m.id !== messageId);
        const lastMsg = remaining[remaining.length - 1];
        return {
          ...c,
          messages: remaining,
          lastMessage: lastMsg ? lastMsg.text : 'No messages',
          lastMessageTime: lastMsg ? lastMsg.timestamp : ''
        };
      });
      if (user?.email) {
        const key = `godysell_private_convs_${user.email.trim().toLowerCase()}`;
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const clearAllConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    if (user?.email) {
      const key = `godysell_private_convs_${user.email.trim().toLowerCase()}`;
      try {
        localStorage.setItem(key, JSON.stringify([]));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jiji_gh_favorites');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        return parsed.filter((id) => !DEFAULT_PRODUCT_IDS.has(id));
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Announcements
  const [announcement, setAnnouncement] = useState<SiteAnnouncement>(() => {
    try {
      const saved = localStorage.getItem('jiji_gh_announcement');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ANNOUNCEMENT;
  });

  // Navigation & View States (supporting /about direct URL routing)
  const [activeView, setActiveViewState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/about')) {
      return 'about';
    }
    return 'marketplace';
  });

  const setActiveView = (view: ViewMode) => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'about' ? '/about' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.toLowerCase().startsWith('/about')) {
        setActiveViewState('about');
      } else {
        setActiveViewState((prev) => (prev === 'about' ? 'marketplace' : prev));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProductState] = useState<Product | null>(null);

  const setSelectedProduct = (prodOrUpdater: Product | null | ((prev: Product | null) => Product | null)) => {
    setSelectedProductState((prev) => {
      const next = typeof prodOrUpdater === 'function' ? prodOrUpdater(prev) : prodOrUpdater;
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          if (next && next.id) {
            url.searchParams.set('product', next.id);
          } else {
            url.searchParams.delete('product');
          }
          window.history.replaceState({}, '', url.toString());
        } catch {}
      }
      return next;
    });
  };

  // Auto-open product when visiting direct shareable link (e.g. ?product=prod-123)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlProductId = params.get('product') || (window.location.hash.startsWith('#product-') ? window.location.hash.replace('#product-', '') : null);
      if (urlProductId && products.length > 0) {
        const found = products.find((p) => p.id === urlProductId);
        if (found) {
          setSelectedProductState(found);
        }
      }
    } catch {}
  }, [products]);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatProduct, setChatProduct] = useState<Product | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };
  const dismissToast = () => setToast(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshProducts = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const live = await fetchOnlineProducts();
      if (Array.isArray(live)) {
        const genuine = live.filter((p) => !isDemoOrTestProduct(p));
        setProducts((current) => {
          const map = new Map<string, Product>();
          for (const p of genuine) map.set(p.id, p);
          for (const p of current) {
            if (!isDemoOrTestProduct(p) && !map.has(p.id)) {
              map.set(p.id, p);
            }
          }
          return Array.from(map.values());
        });
      }
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to refresh listings');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync to local storage
  useEffect(() => {
    try {
      const genuine = products.filter((p) => !isDemoOrTestProduct(p));
      localStorage.setItem('jiji_gh_products', JSON.stringify(genuine));
      localStorage.setItem('godysell_shared_products_cache', JSON.stringify(genuine));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Real-Time Shared Cross-Device Product Synchronization with Supabase PostgreSQL
  // Supabase Realtime channel ensures that when Seller A publishes an item, Seller B on another device sees it immediately without page reloading
  useEffect(() => {
    let isMounted = true;

    // 1. Live Supabase Realtime Channel Subscription
    const unsubscribeSupabase = subscribeToSupabaseProducts(
      (liveProducts) => {
        if (!isMounted) return;
        const genuine = liveProducts.filter((p) => !isDemoOrTestProduct(p));
        setProducts((current) => {
          const map = new Map<string, Product>();
          for (const p of genuine) map.set(p.id, p);
          for (const p of current) {
            if (!isDemoOrTestProduct(p) && !map.has(p.id)) {
              map.set(p.id, p);
            }
          }
          const merged = Array.from(map.values());
          if (JSON.stringify(current) !== JSON.stringify(merged)) {
            return merged;
          }
          return current;
        });
        setSyncError(null);
      },
      (err) => {
        console.warn('Supabase real-time subscription notice:', err);
      }
    );

    // 2. Fallback polling for backup channels
    const silentSync = async () => {
      try {
        const liveProducts = await fetchOnlineProducts();
        if (isMounted && Array.isArray(liveProducts)) {
          const genuine = liveProducts.filter((p) => !isDemoOrTestProduct(p));
          setProducts((current) => {
            const map = new Map<string, Product>();
            for (const p of genuine) map.set(p.id, p);
            for (const p of current) {
              if (!isDemoOrTestProduct(p) && !map.has(p.id)) {
                map.set(p.id, p);
              }
            }
            const merged = Array.from(map.values());
            if (JSON.stringify(current) !== JSON.stringify(merged)) {
              return merged;
            }
            return current;
          });
          setSyncError(null);
        }
      } catch (err: any) {
        // Silent background catch
      }
    };

    // Initial silent sync on mount and upgrade legacy 2024 records to 2026
    upgradeLegacyMemberSinceInDatabase().catch(() => {});
    try {
      const rawAccounts = localStorage.getItem('godysell_google_accounts');
      if (rawAccounts) {
        const parsed = JSON.parse(rawAccounts);
        if (Array.isArray(parsed)) {
          const upgraded = parsed.map((a: any) => ({ ...a, memberSince: '2026' }));
          localStorage.setItem('godysell_google_accounts', JSON.stringify(upgraded));
        }
      }
    } catch {}
    silentSync();

    // Sync on tab focus or when user returns to app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        silentSync();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', silentSync);

    const pollInterval = setInterval(silentSync, 10000);

    return () => {
      isMounted = false;
      unsubscribeSupabase();
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', silentSync);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jiji_gh_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('jiji_gh_inquiries', JSON.stringify(inquiries));
    } catch (e) {
      console.error(e);
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem('jiji_gh_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('jiji_gh_announcement', JSON.stringify(announcement));
    } catch (e) {
      console.error(e);
    }
  }, [announcement]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isProductOwner = (productOrId: Product | string): boolean => {
    if (!user?.email) return false;
    const normalized = user.email.trim().toLowerCase();
    if (normalized === 'godfredowusu370@gmail.com') return true;
    const prod = typeof productOrId === 'string' ? products.find((p) => p.id === productOrId) : productOrId;
    if (!prod || !prod.sellerEmail) return false;
    return prod.sellerEmail.trim().toLowerCase() === normalized;
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'views' | 'inquiries' | 'salesCount' | 'createdAt'>): Promise<boolean> => {
    const finalSellerEmail = user?.email?.trim().toLowerCase() || 'vendor@godysell.com';
    const finalSellerName = productData.sellerName?.trim() || user?.name || 'Seller';
    
    // Determine seller phone: form input takes priority, then user profile phone. Never fabricate or default.
    const enteredPhone = productData.sellerPhone !== undefined ? productData.sellerPhone.trim() : '';
    const finalSellerPhone = enteredPhone || (user?.phone ? user.phone.trim() : '');

    const finalMemberSince = '2026';

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      sellerEmail: finalSellerEmail,
      sellerName: finalSellerName,
      sellerPhone: finalSellerPhone,
      sellerMemberSince: finalMemberSince,
      views: 1,
      inquiries: 0,
      salesCount: 0,
      createdAt: new Date().toISOString()
    };

    // If seller provided/updated phone number, update seller account and propagate to all listings
    if (finalSellerPhone && user && user.email) {
      if (user.phone !== finalSellerPhone) {
        updateUserProfile({ phone: finalSellerPhone, name: finalSellerName });
      } else {
        updateSellerContactAcrossAllProducts(finalSellerEmail, finalSellerPhone, finalSellerName).catch(() => {});
      }
    }

    // 1. Immediately reflect in state so it appears in the Shop page permanently
    // and synchronize any existing products by this seller to the new phone
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (finalSellerPhone && p.sellerEmail && p.sellerEmail.trim().toLowerCase() === finalSellerEmail) {
          return { ...p, sellerPhone: finalSellerPhone, sellerName: finalSellerName };
        }
        return p;
      });
      return [newProduct, ...updated.filter((p) => p.id !== newProduct.id)];
    });

    // 2. Immediately cache in localStorage so it persists across refreshes
    try {
      const storedStr = localStorage.getItem('godysell_shared_products_cache');
      const list = storedStr ? JSON.parse(storedStr) : [];
      const updatedList = [newProduct, ...(Array.isArray(list) ? list.filter((p: any) => p.id !== newProduct.id) : [])];
      localStorage.setItem('godysell_shared_products_cache', JSON.stringify(updatedList));
      localStorage.setItem('jiji_gh_products', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Local cache error:', e);
    }

    // 3. Persist to shared online cloud database & local API
    try {
      await publishProductToCloud(newProduct, user?.id);
      showToast('Product published successfully!', 'success');
    } catch (err: any) {
      console.warn('Cloud persistence warning, product safely kept in local shop catalog:', err);
    }

    if (typeof window !== 'undefined') {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(() => {});
    }

    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    // Only the owner or admin can edit their published product
    if (!isProductOwner(id)) {
      showToast("Unauthorized: You can only edit your own products.", "error");
      return false;
    }

    // If phone was updated during product edit, update profile and all products
    if (updates.sellerPhone !== undefined && user && user.email) {
      const trimmedPhone = updates.sellerPhone.trim();
      if (trimmedPhone && trimmedPhone !== user.phone) {
        updateUserProfile({ phone: trimmedPhone });
      }
    }
    const previous = products;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      await updateProductInCloud(id, updates, user?.email);
      showToast('Product updated successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('Failed to update product in cloud database:', err);
      setProducts(previous);
      showToast(err.message || 'Failed to update product.', 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    // Only the owner or admin can delete their published product
    if (!isProductOwner(id)) {
      showToast("Unauthorized: You can only delete your own products.", "error");
      return false;
    }
    const previous = products;
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('godysell_shared_products_cache', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }

    try {
      await deleteProductFromCloud(id, user?.email);
      showToast('Product deleted successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('Failed to delete product in cloud database:', err);
      setProducts(previous);
      showToast(err.message || 'Failed to delete product.', 'error');
      throw err;
    }
  };

  const updateStock = (id: string, newStock: number) => {
    if (!isProductOwner(id)) return;
    const safeStock = Math.max(0, newStock);
    const status = safeStock === 0 ? 'paused' : 'active';
    updateProduct(id, { stock: safeStock, status });
  };

  const incrementStock = (id: string, delta: number) => {
    if (!isProductOwner(id)) return;
    const current = products.find(p => p.id === id);
    if (!current) return;
    const newStock = Math.max(0, current.stock + delta);
    const status = newStock === 0 ? 'paused' : current.status;
    updateProduct(id, { stock: newStock, status });
  };

  const toggleProductStatus = (id: string) => {
    if (!isProductOwner(id)) return;
    const current = products.find(p => p.id === id);
    if (!current) return;
    const nextStatus = current.status === 'active' ? 'paused' : 'active';
    updateProduct(id, { status: nextStatus });
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setOrders(prev => [newOrder, ...prev]);

    // decrement product stock and increment sales count
    setProducts(prev =>
      prev.map(p => {
        if (p.id === orderData.productId) {
          const newStock = Math.max(0, p.stock - orderData.quantity);
          return {
            ...p,
            stock: newStock,
            salesCount: p.salesCount + orderData.quantity,
            status: newStock === 0 ? 'paused' : p.status
          };
        }
        return p;
      })
    );
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'timestamp' | 'unread'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      unread: true
    };
    setInquiries(prev => [newInquiry, ...prev]);

    // bump inquiry count on product
    setProducts(prev =>
      prev.map(p =>
        p.id === inquiryData.productId ? { ...p, inquiries: p.inquiries + 1 } : p
      )
    );
  };

  const markInquiryRead = (id: string) => {
    setInquiries(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, unread: false } : inq))
    );
  };

  const updateAnnouncement = (newAnn: SiteAnnouncement) => {
    setAnnouncement(newAnn);
  };

  const recordSale = (params: {
    productId: string;
    quantity: number;
    buyerName: string;
    buyerPhone: string;
    buyerLocation: string;
    paymentMethod: Order['paymentMethod'];
  }) => {
    const targetProduct = products.find(p => p.id === params.productId);
    if (!targetProduct || targetProduct.stock < params.quantity) {
      return false;
    }

    addOrder({
      productId: targetProduct.id,
      productTitle: targetProduct.title,
      productImage: targetProduct.images[0] || '',
      buyerName: params.buyerName,
      buyerPhone: params.buyerPhone,
      buyerLocation: params.buyerLocation,
      quantity: params.quantity,
      totalAmount: targetProduct.price * params.quantity,
      status: 'confirmed',
      paymentMethod: params.paymentMethod
    });

    return true;
  };

  const submitReport = async (report: {
    reportedProductId?: string;
    reportedSellerEmail?: string;
    reporterEmail?: string;
    reason: string;
    details?: string;
  }): Promise<boolean> => {
    return await submitUserReportToSupabase({
      ...report,
      reporterEmail: report.reporterEmail || user?.email || undefined,
    });
  };

  const submitSupportMessage = async (support: {
    userName: string;
    userEmail: string;
    userPhone?: string;
    subject: string;
    message: string;
  }): Promise<boolean> => {
    return await submitSupportMessageToSupabase(support);
  };

  const openCreateProductModal = (prodToEdit?: Product) => {
    if (prodToEdit && !isProductOwner(prodToEdit)) {
      alert("You cannot edit this product because it was published by another seller.");
      return;
    }
    setEditingProduct(prodToEdit || null);
    setIsCreateProductModalOpen(true);
  };

  const closeCreateProductModal = () => {
    setEditingProduct(null);
    setIsCreateProductModalOpen(false);
  };

  const openRecordSaleModal = () => setIsRecordSaleModalOpen(true);
  const closeRecordSaleModal = () => setIsRecordSaleModalOpen(false);

  const openChatModal = (product: Product) => {
    setChatProduct(product);
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setChatProduct(null);
    setIsChatModalOpen(false);
  };

  // User's own products and metrics for Seller Hub
  const myProducts = useMemo(() => {
    if (!user?.email) return [];
    const normalized = user.email.trim().toLowerCase();
    return products.filter((p) => p.sellerEmail && p.sellerEmail.trim().toLowerCase() === normalized);
  }, [products, user?.email]);

  const myOrders = useMemo(() => {
    if (!user?.email) return [];
    const myProdIds = new Set(myProducts.map((p) => p.id));
    return orders.filter((o) => myProdIds.has(o.productId));
  }, [orders, myProducts, user?.email]);

  const myInquiries = useMemo(() => {
    if (!user?.email) return [];
    const myProdIds = new Set(myProducts.map((p) => p.id));
    return inquiries.filter((inq) => myProdIds.has(inq.productId));
  }, [inquiries, myProducts, user?.email]);

  const myTotalRevenue = useMemo(() => {
    return myOrders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.totalAmount : 0), 0);
  }, [myOrders]);

  const myUnitsSold = useMemo(() => {
    return myOrders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.quantity : 0), 0);
  }, [myOrders]);

  const myActiveListingsCount = myProducts.filter((p) => p.status === 'active' || p.status === 'boosted').length;
  const myLowStockCount = myProducts.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const myOutOfStockCount = myProducts.filter((p) => p.stock === 0).length;

  // Global KPI Calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.totalAmount : 0), 0);
  const totalUnitsSold = orders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.quantity : 0), 0);
  const activeListingsCount = products.filter(p => p.status === 'active' || p.status === 'boosted').length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        loginWithGoogle,
        updateUserProfile,
        logout,
        products,
        orders,
        inquiries,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        replyAsSeller,
        startOrOpenChatForProduct,
        deleteConversation,
        deleteMessage,
        clearAllConversations,
        totalUnreadChatCount,
        isTypingByConv,
        chatRole,
        setChatRole,
        showOnlySaved,
        setShowOnlySaved,
        favorites,
        activeView,
        deviceMode,
        announcement,
        selectedCategory,
        selectedRegion,
        searchQuery,
        selectedProduct,
        isCreateProductModalOpen,
        isRecordSaleModalOpen,
        isChatModalOpen,
        chatProduct,
        editingProduct,
        isSyncing,
        syncError,
        refreshProducts,
        setSearchQuery,
        setSelectedCategory,
        setSelectedRegion,
        setSelectedProduct,
        toggleFavorite,
        setActiveView,
        setDeviceMode,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        incrementStock,
        toggleProductStatus,
        addOrder,
        updateOrderStatus,
        addInquiry,
        markInquiryRead,
        updateAnnouncement,
        recordSale,
        openCreateProductModal,
        closeCreateProductModal,
        openRecordSaleModal,
        closeRecordSaleModal,
        openChatModal,
        closeChatModal,
        totalRevenue,
        totalUnitsSold,
        activeListingsCount,
        lowStockCount,
        outOfStockCount,
        totalViews,
        myProducts,
        myOrders,
        myInquiries,
        myTotalRevenue,
        myUnitsSold,
        myActiveListingsCount,
        myLowStockCount,
        myOutOfStockCount,
        isProductOwner,
        submitReport,
        submitSupportMessage,
        toast,
        showToast,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
