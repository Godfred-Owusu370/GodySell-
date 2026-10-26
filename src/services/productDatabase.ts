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
 * Fetch all shared products from the online persistent cloud database
 */
export async function fetchOnlineProducts(): Promise<Product[]> {
  // 1. Try Primary Cloud Database
  try {
    const res = await fetchWithTimeout(PRIMARY_CLOUD_DB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const result = await res.json();
      const products: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      // Update local storage cache
      setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
      return products;
    }
  } catch (err) {
    console.warn('Primary cloud DB fetch failed, attempting backup endpoint:', err);
  }

  // 2. Try Secondary / Backup Cloud Database
  try {
    const res = await fetchWithTimeout(BACKUP_CLOUD_DB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const result = await res.json();
      const products: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      if (products.length > 0) {
        setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        return products;
      }
    }
  } catch (err) {
    console.warn('Backup cloud DB fetch failed:', err);
  }

  // 3. Try Local / Vercel API endpoint
  if (typeof window !== 'undefined') {
    try {
      const localRes = await fetchWithTimeout('/api/products');
      if (localRes.ok) {
        const localProducts = await localRes.json();
        if (Array.isArray(localProducts) && localProducts.length > 0) {
          setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(localProducts));
          return localProducts;
        }
      }
    } catch {
      // Ignore
    }
  }

  // 4. Fallback to LocalStorage cache
  const cached = getLocalItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
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

  // 1. Sync to Primary Cloud Database
  try {
    const res = await fetchWithTimeout(PRIMARY_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });

    if (res.ok) {
      savedSuccessfully = true;
    } else {
      lastError = `Primary HTTP ${res.status}: ${await res.text().catch(() => '')}`;
      console.warn('Primary cloud DB save warning:', lastError);
    }
  } catch (err: any) {
    lastError = err?.message || 'Network error on primary';
    console.warn('Primary cloud DB error:', lastError);
  }

  // 2. Sync to Backup Cloud Database (for redundancy or if primary failed)
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

  // 3. Also notify /api/products/sync-all in local development
  if (typeof window !== 'undefined') {
    fetch('/api/products/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }).catch(() => {});
  }

  if (!savedSuccessfully) {
    throw new Error(`Failed to save product to central database: ${lastError || 'Network timeout'}`);
  }

  return true;
}

/**
 * Publish a new product to the shared online database
 */
export async function publishProductToCloud(product: Product): Promise<Product[]> {
  const current = await fetchOnlineProducts();
  const updated = [product, ...current.filter((p) => p.id !== product.id)];
  await syncCatalogToCloud(updated);
  return updated;
}

/**
 * Update an existing product in the shared online database
 */
export async function updateProductInCloud(productId: string, updates: Partial<Product>): Promise<Product[]> {
  const current = await fetchOnlineProducts();
  const updated = current.map((p) => (p.id === productId ? { ...p, ...updates } : p));
  await syncCatalogToCloud(updated);
  return updated;
}

/**
 * Delete a product from the shared online database
 */
export async function deleteProductFromCloud(productId: string): Promise<Product[]> {
  const current = await fetchOnlineProducts();
  const updated = current.filter((p) => p.id !== productId);
  await syncCatalogToCloud(updated);
  return updated;
}
