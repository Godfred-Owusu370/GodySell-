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
    sellerPhone: row.seller_phone || '',
    sellerEmail: row.seller_email || '',
    sellerMemberSince: (!row.seller_member_since || String(row.seller_member_since).includes('2024')) ? '2026' : String(row.seller_member_since),
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
    seller_phone: product.sellerPhone || '',
    seller_email: product.sellerEmail || '',
    seller_member_since: (!product.sellerMemberSince || String(product.sellerMemberSince).includes('2024')) ? '2026' : String(product.sellerMemberSince),
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
    const payload: any = {
      id: profile.id,
      name: profile.name,
      email: profile.email.toLowerCase().trim(),
      picture: profile.picture || null,
      region: profile.region || 'Greater Accra',
      is_verified: profile.isVerified ?? true,
      member_since: (!profile.memberSince || String(profile.memberSince).includes('2024')) ? '2026' : String(profile.memberSince),
      updated_at: new Date().toISOString(),
    };
    if (profile.phone) {
      payload.phone = profile.phone;
    }

    const { error } = await sb.from('profiles').upsert(payload, { onConflict: 'email' });
    if (error) {
      console.warn('Supabase profile sync notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase profile sync error:', err);
  }
}

/**
 * Fetch existing user profile from Supabase profiles table
 */
export async function fetchUserProfileFromSupabase(email: string): Promise<Partial<UserProfile> | null> {
  const sb = getSupabase();
  if (!sb || !email) return null;

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture,
        phone: data.phone || '',
        region: data.region || 'Greater Accra',
        isVerified: data.is_verified ?? true,
        memberSince: (!data.member_since || String(data.member_since).includes('2024')) ? '2026' : String(data.member_since),
      };
    }
  } catch (err) {
    console.warn('Error fetching profile from Supabase:', err);
  }
  return null;
}

/**
 * Automatically upgrades any legacy 2024 membership years to 2026 in the Supabase database.
 */
export async function upgradeLegacyMemberSinceInDatabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // 1. Upgrade products where seller_member_since contains 2024 or is 2024 or V-istore / V-store
    await sb
      .from('products')
      .update({ seller_member_since: '2026' })
      .or('seller_member_since.eq.2024,seller_member_since.ilike.%2024%,seller_name.ilike.%V-store%,seller_name.ilike.%V-istore%');

    // 2. Upgrade profiles where member_since contains 2024
    await sb
      .from('profiles')
      .update({ member_since: '2026' })
      .or('member_since.eq.2024,member_since.ilike.%2024%');
  } catch (err) {
    console.warn('Notice upgrading legacy member_since:', err);
  }
}

/**
 * Updates seller contact phone across all products published by this seller in Supabase
 */
export async function updateSellerContactAcrossAllProducts(
  sellerEmail: string,
  newPhone: string,
  newName?: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !sellerEmail) return;

  try {
    const updates: any = {
      seller_phone: newPhone,
      updated_at: new Date().toISOString()
    };
    if (newName) {
      updates.seller_name = newName;
    }

    const { error } = await sb
      .from('products')
      .update(updates)
      .eq('seller_email', sellerEmail.toLowerCase().trim());

    if (error) {
      console.warn('Notice updating seller contact across products in Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Error updating seller contact across products:', err);
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
