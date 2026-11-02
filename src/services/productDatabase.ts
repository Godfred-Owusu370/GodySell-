import { Product } from '../types/index';
import {
  getSupabase,
  isSupabaseConfigured,
  mapRowToProduct,
  mapProductToRow
} from './supabase';
import { compressImageFile } from '../utils/imageCompressor';

const LOCAL_STORAGE_KEY = 'godysell_shared_products_cache';

function getLocalItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function setLocalItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {}
}

/**
 * Filter out any mock, test, demo, or placeholder products so only genuine user listings appear
 */
export function filterGenuineProducts(products: any[]): Product[] {
  if (!Array.isArray(products)) return [];
  return products.filter((p) => {
    if (!p) return false;
    const id = String(p.id || '');
    const title = String(p.title || '').trim().toLowerCase();
    if (id.startsWith('prod-test-') || id.startsWith('prod-00')) {
      return false;
    }
    if (title.startsWith('test product') || title === 'sample product' || title.includes('sample listing')) {
      return false;
    }
    return true;
  });
}

/**
 * Upload product photo to Supabase Storage with graceful fallback
 */
export async function uploadProductImageToStorage(file: File): Promise<string> {
  const sb = getSupabase();

  // Validate format
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (file.type && !validMimes.includes(file.type)) {
    throw new Error('Unsupported image format. Please use JPG, PNG, or WebP.');
  }

  // Validate size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit. Please choose a smaller photo.');
  }

  // 1. If Supabase is connected, upload to 'product-images' bucket
  if (sb) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `products/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${cleanName}`;

      const { error: uploadError } = await sb.storage
        .from('product-images')
        .upload(filePath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicData } = sb.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else {
        console.warn('Supabase Storage upload notice, using optimized client compression:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase Storage exception, using client compression:', err);
    }
  }

  // 2. Reliable Fallback: client-side image compression
  return await compressImageFile(file, {
    maxWidth: 900,
    maxHeight: 900,
    quality: 0.75,
  });
}

/**
 * Real-time Supabase subscription
 * Triggers onUpdate immediately when any seller on any device publishes, edits, or deletes a product
 */
export function subscribeToSupabaseProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  const sb = getSupabase();

  if (!sb) {
    // If Supabase not configured yet, no-op unsubscribe
    return () => {};
  }

  try {
    const channel = sb
      .channel('godysell-realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          // Whenever a change occurs, fetch fresh catalog
          try {
            const fresh = await fetchOnlineProducts();
            onUpdate(fresh);
          } catch (err: any) {
            if (onError) onError(err);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Supabase Realtime subscription notice:', err.message);
          if (onError) onError(err);
        }
      });

    return () => {
      try {
        sb.removeChannel(channel);
      } catch {}
    };
  } catch (err: any) {
    console.warn('Could not attach Supabase Realtime channel:', err);
    return () => {};
  }
}

// Backwards-compatible alias for existing imports
export const subscribeToFirestoreProducts = subscribeToSupabaseProducts;

/**
 * Fetch all shared products from Supabase (Primary) with resilient fallbacks
 */
export async function fetchOnlineProducts(): Promise<Product[]> {
  const sb = getSupabase();

  // 1. Primary: Cloud Supabase PostgreSQL Database
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapRowToProduct);
        const genuine = filterGenuineProducts(mapped);
        setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
        return genuine;
      } else if (error) {
        console.warn('Supabase fetch notice, trying API fallback:', error.message);
      }
    } catch (err) {
      console.warn('Supabase connection warning, falling back to local API:', err);
    }
  }

  // 2. Secondary: Local / Vercel API endpoint
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const genuine = filterGenuineProducts(data);
          setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
          return genuine;
        }
      }
    } catch {}
  }

  // 3. Tertiary: LocalStorage cache
  const cached = getLocalItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return filterGenuineProducts(parsed);
      }
    } catch (e) {
      console.error('Failed to parse cached products', e);
    }
  }

  return [];
}

/**
 * Publish a new product to Supabase Database
 * Reflects across all devices and browsers in real-time
 */
export async function publishProductToCloud(product: Product, userId?: string | null): Promise<Product[]> {
  const genuineOnly = filterGenuineProducts([product]);
  if (genuineOnly.length === 0) return [];

  // Update local cache immediately
  const cachedStr = getLocalItem(LOCAL_STORAGE_KEY);
  const currentCached: Product[] = cachedStr ? JSON.parse(cachedStr) : [];
  const updatedList = [product, ...currentCached.filter((p) => p.id !== product.id)];
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  // 1. Primary: Save directly to Supabase PostgreSQL database
  const sb = getSupabase();
  if (sb) {
    try {
      const row = mapProductToRow(product, userId);
      const { error } = await sb
        .from('products')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Supabase product publish error:', error.message);
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.warn('Supabase product publish exception, forwarding to API:', err.message);
      // Fall through to API save
    }
  }

  // 2. Also notify local / Vercel API endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }).catch(() => {});
  }

  return updatedList;
}

/**
 * Update an existing product in Supabase
 */
export async function updateProductInCloud(productId: string, updates: Partial<Product>): Promise<Product[]> {
  const sb = getSupabase();

  if (sb) {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
      if (updates.region !== undefined) updateData.region = updates.region;
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.condition !== undefined) updateData.condition = updates.condition;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.negotiable !== undefined) updateData.negotiable = updates.negotiable;

      const { error } = await sb
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) {
        console.warn('Supabase update notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase update error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }

  const current = await fetchOnlineProducts().catch(() => []);
  const updated = current.map((p) => (p.id === productId ? { ...p, ...updates } : p));
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Delete a product from Supabase
 */
export async function deleteProductFromCloud(productId: string): Promise<Product[]> {
  const sb = getSupabase();

  if (sb) {
    try {
      // Mark as archived first to immediately hide from all queries and public shop
      await sb
        .from('products')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', productId);

      const { error } = await sb
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.warn('Supabase delete notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }

  const current = await fetchOnlineProducts().catch(() => []);
  const updated = current.filter((p) => p.id !== productId);
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
