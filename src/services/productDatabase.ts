import { Product } from '../types';

// Dedicated Shared Persistent Online Cloud Database for GodySell Marketplace
// Synchronizes all published products in real-time across all devices, accounts, and Vercel deployments
const CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/abfaaea';
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

export interface CloudCatalogPayload {
  products: Product[];
}

/**
 * Fetch all shared products from the online persistent cloud database
 */
export async function fetchOnlineProducts(): Promise<Product[]> {
  try {
    const res = await fetch(CLOUD_DB_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const result = await res.json();
      const products: Product[] = Array.isArray(result?.products)
        ? result.products
        : Array.isArray(result?.data?.products)
        ? result.data.products
        : [];
      
      // Update local cache for instant offline fallback
      setLocalItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
      return products;
    }
  } catch (err) {
    console.warn('Direct cloud DB fetch error, falling back to cache:', err);
  }

  // Backup 1: Local server endpoint if running with Express in browser
  if (typeof window !== 'undefined') {
    try {
      const localRes = await fetch('/api/products');
      if (localRes.ok) {
        const localProducts = await localRes.json();
        if (Array.isArray(localProducts)) {
          return localProducts;
        }
      }
    } catch {
      // Ignore if offline
    }
  }

  // Backup 2: LocalStorage cache
  const cached = getLocalItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
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

  // Sync to Online Persistent Database
  try {
    const payload: CloudCatalogPayload = {
      products
    };

    const res = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Also sync to local /api/products if in browser
      if (typeof window !== 'undefined') {
        fetch('/api/products/sync-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products)
        }).catch(() => {});
      }
      return true;
    } else {
      const errText = await res.text();
      console.error('Cloud DB PUT failed:', res.status, errText);
    }
  } catch (err) {
    console.error('Failed to sync catalog to cloud database:', err);
  }

  return false;
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
