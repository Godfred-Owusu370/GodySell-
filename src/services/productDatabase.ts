import { Product } from '../types';

// Dual-Cloud Resilient Central Database Adapter for GodySell Ghana Marketplace
// Synchronizes all published listings across all accounts, devices, and Vercel deployments
export const PRIMARY_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/abfaaea';
export const BACKUP_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/adabcaa';
const LOCAL_STORAGE_KEY = 'godysell_shared_products_cache';
const FETCH_TIMEOUT_MS = 7000;

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
 * Perform a fetch with a strict timeout to prevent hung requests
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
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
 * Fetch all shared products from the online persistent cloud database
 */
export async function fetchOnlineProducts(): Promise<Product[]> {
  const t = Date.now();
  const remoteMap = new Map<string, Product>();

  // 1. Try Local / Vercel API endpoint (fastest, same-origin)
  if (typeof window !== 'undefined') {
    try {
      const localRes = await fetchWithTimeout(`/api/products?t=${t}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store', 'Accept': 'application/json' }
      });
      if (localRes.ok) {
        const localProducts = await localRes.json();
        if (Array.isArray(localProducts)) {
          const genuine = filterGenuineProducts(localProducts);
          for (const p of genuine) remoteMap.set(p.id, p);
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Try Primary Cloud Database with cache-busting
  try {
    const res = await fetchWithTimeout(`${PRIMARY_CLOUD_DB_URL}?t=${t}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store' }
    });

    if (res.ok) {
      const result = await res.json();
      const rawProducts: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      const genuine = filterGenuineProducts(rawProducts);
      for (const p of genuine) {
        if (!remoteMap.has(p.id)) remoteMap.set(p.id, p);
      }
    }
  } catch (err) {
    console.warn('Primary cloud DB fetch failed, attempting backup endpoint:', err);
  }

  // 3. Try Secondary / Backup Cloud Database if still empty
  if (remoteMap.size === 0) {
    try {
      const res = await fetchWithTimeout(`${BACKUP_CLOUD_DB_URL}?t=${t}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store' }
      });

      if (res.ok) {
        const result = await res.json();
        const rawProducts: Product[] = Array.isArray(result?.products)
          ? result.products
          : Array.isArray(result?.data?.products)
          ? result.data.products
          : [];

        const genuine = filterGenuineProducts(rawProducts);
        for (const p of genuine) {
          if (!remoteMap.has(p.id)) remoteMap.set(p.id, p);
        }
      }
    } catch (err) {
      console.warn('Backup cloud DB fetch failed:', err);
    }
  }

  const combined = Array.from(remoteMap.values());
  if (combined.length > 0) {
    setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
    return combined;
  }

  // 4. Fallback to LocalStorage cache
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
 * Save the entire catalog to the persistent online cloud database
 */
export async function syncCatalogToCloud(products: Product[]): Promise<boolean> {
  const genuineOnly = filterGenuineProducts(products);
  // Update cache immediately
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuineOnly));

  const payload = JSON.stringify({ products: genuineOnly });

  // 1. In browser, use /api/products (same-origin, proxies to cloud DB with no browser CORS preflight issue)
  if (typeof window !== 'undefined') {
    try {
      await fetchWithTimeout('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
    } catch (e: any) {
      console.warn('/api/products sync failed:', e);
    }
  }

  // 2. Direct Cloud Database (dual write ensures immediate global replication)
  try {
    await fetchWithTimeout(PRIMARY_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
  } catch (err: any) {
    console.warn('Primary cloud sync warning:', err);
  }

  // 3. Backup Cloud Database
  try {
    await fetchWithTimeout(BACKUP_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
  } catch (backupErr) {
    console.warn('Backup cloud DB sync warning:', backupErr);
  }

  return true;
}

/**
 * Publish a new product to the shared online database
 */
export async function publishProductToCloud(product: Product): Promise<Product[]> {
  const current = await fetchOnlineProducts().catch(() => []);
  const updated = [product, ...current.filter((p) => p.id !== product.id)];
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  // 1. Post to /api/products
  if (typeof window !== 'undefined') {
    try {
      await fetchWithTimeout('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch (err) {
      console.warn('POST /api/products warning:', err);
    }
  }

  // 2. Direct Cloud Sync (ensures all devices querying ExtendsClass receive it)
  try {
    await syncCatalogToCloud(updated);
  } catch (err) {
    console.warn('Direct cloud sync warning:', err);
  }

  return updated;
}

/**
 * Update an existing product in the shared online database
 */
export async function updateProductInCloud(productId: string, updates: Partial<Product>): Promise<Product[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetchWithTimeout(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const current = await fetchOnlineProducts().catch(() => []);
        const updated = current.map((p) => (p.id === productId ? { ...p, ...updates } : p));
        setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = await fetchOnlineProducts();
  const updated = current.map((p) => (p.id === productId ? { ...p, ...updates } : p));
  await syncCatalogToCloud(updated);
  return updated;
}

/**
 * Delete a product from the shared online database
 */
export async function deleteProductFromCloud(productId: string): Promise<Product[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetchWithTimeout(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = await fetchOnlineProducts().catch(() => []);
        const updated = current.filter((p) => p.id !== productId);
        setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = await fetchOnlineProducts();
  const updated = current.filter((p) => p.id !== productId);
  await syncCatalogToCloud(updated);
  return updated;
}
