import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, UserProfile } from '../types/index';

const DEFAULT_SUPABASE_URL = 'https://pqktfgsxgaslyngffwxo.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_q30L3DUFiJq7MQUOvYUadQ_ThPuF6BO';

// Retrieve Supabase environment variables from Vite, Next, process.env, or defaults
const supabaseUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL)) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  DEFAULT_SUPABASE_URL
).trim();

const supabaseAnonKey = (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
  DEFAULT_SUPABASE_KEY
).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://')
  );
};

// Singleton Supabase client instance
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
}

export const supabase = isSupabaseConfigured()
  ? getSupabase()
  : createClient(
      'https://placeholder-godysell.supabase.co',
      'placeholder-anon-key',
      { auth: { persistSession: false } }
    );

/**
 * Maps Supabase database row (snake_case) to GodySell Product (camelCase)
 */
export function mapRowToProduct(row: any): Product {
  return {
    id: String(row.id),
    title: row.title || '',
    price: Number(row.price) || 0,
    category: row.category || 'Others',
    subcategory: row.subcategory || '',
    region: row.region || 'Greater Accra',
    city: row.city || 'East Legon, Accra',
    condition: row.condition || 'Brand New',
    images: Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : []),
    description: row.description || '',
    negotiable: Boolean(row.negotiable),
    verifiedSeller: Boolean(row.verified_seller ?? true),
    sellerName: row.seller_name || 'Verified Seller',
    sellerPhone: row.seller_phone || '+233(0)592836664',
    sellerEmail: row.seller_email || '',
    sellerMemberSince: row.seller_member_since || 'Sep 2024',
    sellerRating: Number(row.seller_rating) || 5.0,
    sellerReviewCount: Number(row.seller_review_count) || 1,
    stock: Number(row.stock) || 1,
    sku: row.sku || `SKU-${row.id}`,
    status: row.status || 'active',
    views: Number(row.views) || 1,
    inquiries: Number(row.inquiries) || 0,
    salesCount: Number(row.sales_count) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    featured: Boolean(row.featured),
    specifications: (row.specifications && typeof row.specifications === 'object') ? row.specifications : {},
  };
}

/**
 * Maps GodySell Product (camelCase) to Supabase database row (snake_case)
 */
export function mapProductToRow(product: Product, userId?: string | null): any {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    subcategory: product.subcategory || '',
    region: product.region,
    city: product.city,
    condition: product.condition,
    images: product.images || [],
    description: product.description || '',
    negotiable: product.negotiable ?? true,
    verified_seller: product.verifiedSeller ?? true,
    seller_name: product.sellerName,
    seller_phone: product.sellerPhone,
    seller_email: product.sellerEmail || '',
    seller_member_since: product.sellerMemberSince || 'Sep 2024',
    seller_rating: product.sellerRating || 5.0,
    seller_review_count: product.sellerReviewCount || 1,
    stock: product.stock ?? 1,
    sku: product.sku || `SKU-${product.id}`,
    status: product.status || 'active',
    views: product.views || 1,
    inquiries: product.inquiries || 0,
    sales_count: product.salesCount || 0,
    featured: product.featured ?? false,
    specifications: product.specifications || {},
    created_at: product.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...(userId ? { user_id: userId } : {}),
  };
}

/**
 * Synchronize user profile with Supabase profiles table
 */
export async function syncUserProfileToSupabase(profile: UserProfile): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb.from('profiles').upsert(
      {
        id: profile.id,
        name: profile.name,
        email: profile.email.toLowerCase().trim(),
        picture: profile.picture || null,
        phone: profile.phone || null,
        region: profile.region || 'Greater Accra',
        is_verified: profile.isVerified ?? true,
        member_since: profile.memberSince || 'Sep 2024',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (error) {
      console.warn('Supabase profile sync notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase profile sync error:', err);
  }
}

/**
 * Submit user report to Supabase
 */
export async function submitUserReportToSupabase(report: {
  reportedProductId?: string;
  reportedSellerEmail?: string;
  reporterEmail?: string;
  reason: string;
  details?: string;
}): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return true;

  try {
    const { error } = await sb.from('user_reports').insert([
      {
        reported_product_id: report.reportedProductId || null,
        reported_seller_email: report.reportedSellerEmail || null,
        reporter_email: report.reporterEmail || null,
        reason: report.reason,
        details: report.details || '',
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Report submission notice:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Submit support message to Supabase
 */
export async function submitSupportMessageToSupabase(support: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return true;

  try {
    const { error } = await sb.from('support_messages').insert([
      {
        user_name: support.userName,
        user_email: support.userEmail.toLowerCase().trim(),
        user_phone: support.userPhone || null,
        subject: support.subject,
        message: support.message,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Support message notice:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
