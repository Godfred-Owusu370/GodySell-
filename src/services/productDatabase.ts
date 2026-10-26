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
    if (id.startsWith('prod-test-') || id.startsWith('prod-00') || id.startsWith('prod-test')) {
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
  // 1. Try Local / Vercel API endpoint (fastest, same-origin)
  if (typeof window !== 'undefined') {
    try {
      const localRes = await fetchWithTimeout('/api/products');
      if (localRes.ok) {
        const localProducts = await localRes.json();
        if (Array.isArray(localProducts)) {
          const genuine = filterGenuineProducts(localProducts);
          setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
          return genuine;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Try Primary Cloud Database
  try {
    const res = await fetchWithTimeout(PRIMARY_CLOUD_DB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const result = await res.json();
      const rawProducts: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      const genuine = filterGenuineProducts(rawProducts);
      setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
      return genuine;
    }
  } catch (err) {
    console.warn('Primary cloud DB fetch failed, attempting backup endpoint:', err);
  }

  // 3. Try Secondary / Backup Cloud Database
  try {
    const res = await fetchWithTimeout(BACKUP_CLOUD_DB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const result = await res.json();
      const rawProducts: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      const genuine = filterGenuineProducts(rawProducts);
      setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(genuine));
      return genuine;
    }
  } catch (err) {
    console.warn('Backup cloud DB fetch failed:', err);
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
  // Update cache immediately
  setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(products));

  const payload = JSON.stringify({ products });
  let savedSuccessfully = false;
  let lastError = '';

  // 1. In browser, use /api/products (same-origin, proxies to cloud DB with no browser CORS preflight issue)
  if (typeof window !== 'undefined') {
    try {
      const apiRes = await fetchWithTimeout('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (apiRes.ok) {
        savedSuccessfully = true;
      }
    } catch (e: any) {
      console.warn('/api/products sync failed:', e);
    }
  }

  // 2. Direct Cloud Database (works in Node.js or when CORS allows)
  if (!savedSuccessfully) {
    try {
      const res = await fetchWithTimeout(PRIMARY_CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      if (res.ok) {
        savedSuccessfully = true;
      } else {
        lastError = `Primary HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error on primary';
    }
  }

  // 3. Backup Cloud Database
  if (!savedSuccessfully) {
    try {
      const backupRes = await fetchWithTimeout(BACKUP_CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      if (backupRes.ok) {
        savedSuccessfully = true;
      }
    } catch (backupErr) {
      console.warn('Backup cloud DB sync warning:', backupErr);
    }
  }

  if (!savedSuccessfully && typeof window === 'undefined') {
    throw new Error(`Failed to save product to central database: ${lastError || 'Network timeout'}`);
  }

  return true;
}

/**
 * Publish a new product to the shared online database
 */
export async function publishProductToCloud(product: Product): Promise<Product[]> {
  // 1. Try /api/products directly in browser (Vercel serverless proxy with no CORS issues)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetchWithTimeout('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const current = await fetchOnlineProducts().catch(() => []);
        const updated = [product, ...current.filter((p) => p.id !== product.id)];
        setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch (err) {
      console.warn('POST /api/products failed, falling back to direct cloud sync:', err);
    }
  }

  // 2. Fallback to direct cloud sync
  const current = await fetchOnlineProducts();
  const updated = [product, ...current.filter((p) => p.id !== product.id)];
  await syncCatalogToCloud(updated);
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
