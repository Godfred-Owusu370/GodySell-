export type RegionGhana =
  | 'Greater Accra'
  | 'Ashanti'
  | 'Central'
  | 'Western'
  | 'Eastern'
  | 'Northern'
  | 'Volta'
  | 'Upper East'
  | 'Upper West'
  | 'Bono';

export type ProductCategory =
  | 'Mobile Phones & Tablets'
  | 'Vehicles'
  | 'Property & Real Estate'
  | 'Electronics & Appliances'
  | 'Home, Furniture & Appliances'
  | 'Fashion & Beauty'
  | 'Agriculture & Food'
  | 'Commercial Equipment'
  | 'Jobs & Services'
  | 'Others';

export type ProductCondition =
  | 'Brand New'
  | 'Foreign Used'
  | 'Local Used'
  | 'Refurbished';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: ProductCategory;
  subcategory: string;
  region: RegionGhana;
  city: string;
  condition: ProductCondition;
  images: string[];
  description: string;
  negotiable: boolean;
  verifiedSeller: boolean;
  sellerName: string;
  sellerPhone: string;
  sellerEmail?: string;
  sellerMemberSince: string;
  sellerRating: number;
  sellerReviewCount: number;
  stock: number;
  sku: string;
  status: 'active' | 'paused' | 'boosted';
  views: number;
  inquiries: number;
  salesCount: number;
  createdAt: string;
  featured: boolean;
  specifications: Record<string, string>;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  buyerPhone: string;
  buyerLocation: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod: 'Cash on Delivery' | 'Mobile Money (MTN/Telecel)' | 'Bank Transfer';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  offeredPrice?: number;
  isOffer?: boolean;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  sellerName: string;
  sellerPhone: string;
  sellerRating: number;
  sellerVerified: boolean;
  buyerName: string;
  buyerEmail?: string;
  sellerEmail?: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Inquiry {
  id: string;
  productId: string;
  productTitle: string;
  senderName: string;
  senderPhone: string;
  message: string;
  offeredPrice?: number;
  timestamp: string;
  unread: boolean;
}

export interface SiteAnnouncement {
  id: string;
  text: string;
  badgeText: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  phone?: string;
  region?: RegionGhana;
  isVerified?: boolean;
  memberSince?: string;
}

export type ViewMode = 'marketplace' | 'management' | 'chats';
export type DeviceMode = 'desktop' | 'mobile';
