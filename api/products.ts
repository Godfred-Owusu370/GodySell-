// Vercel Serverless Function for /api/products
// Synchronizes with Supabase PostgreSQL as primary backend with resilient backup
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://pqktfgsxgaslyngffwxo.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_q30L3DUFiJq7MQUOvYUadQ_ThPuF6BO';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_KEY;

const PRIMARY_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/abfaaea';
const BACKUP_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/adabcaa';

function isRealProduct(p: any): boolean {
  if (!p) return false;
  const id = String(p.id || '');
  const title = String(p.title || '').trim().toLowerCase();
  if (id.startsWith('prod-test-') || id.startsWith('prod-00')) return false;
  if (title.startsWith('test product') || title === 'sample product' || title.includes('sample listing')) return false;
  return true;
}

function getSupabaseClient() {
  if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('https://')) {
    try {
      return createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchFromSupabase(): Promise<any[] | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((row: any) => ({
        id: String(row.id),
        title: row.title || '',
        price: Number(row.price) || 0,
        category: row.category || 'Others',
        subcategory: row.subcategory || '',
        region: row.region || 'Greater Accra',
        city: row.city || 'East Legon, Accra',
        condition: row.condition || 'Brand New',
        images: Array.isArray(row.images) ? row.images : [],
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
        specifications: row.specifications || {},
      })).filter(isRealProduct);
    }
  } catch (e) {
    console.warn('Vercel API: Supabase fetch notice:', e);
  }
  return null;
}

async function fetchFromCloud() {
  // 1. Try Supabase first
  const supabaseProducts = await fetchFromSupabase();
  if (supabaseProducts && supabaseProducts.length > 0) {
    return supabaseProducts;
  }

  // 2. Resilient fallback
  const cacheBuster = `?t=${Date.now()}`;
  try {
    const res = await fetch(`${PRIMARY_CLOUD_DB_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data?.products) ? data.products : [];
      return list.filter(isRealProduct);
    }
  } catch (e) {
    console.warn('Vercel API: Primary fetch failed:', e);
  }

  try {
    const res = await fetch(`${BACKUP_CLOUD_DB_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data?.products) ? data.products : [];
      return list.filter(isRealProduct);
    }
  } catch (e) {
    console.warn('Vercel API: Backup fetch failed:', e);
  }

  return [];
}

async function saveToCloud(products: any[]) {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const rows = products.filter(isRealProduct).map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        subcategory: p.subcategory || '',
        region: p.region,
        city: p.city,
        condition: p.condition,
        images: p.images || [],
        description: p.description || '',
        negotiable: p.negotiable ?? true,
        verified_seller: p.verifiedSeller ?? true,
        seller_name: p.sellerName,
        seller_phone: p.sellerPhone || '',
        seller_email: p.sellerEmail || '',
        seller_member_since: (!p.sellerMemberSince || String(p.sellerMemberSince).includes('2024')) ? '2026' : String(p.sellerMemberSince),
        seller_rating: p.sellerRating || 5.0,
        seller_review_count: p.sellerReviewCount || 1,
        stock: p.stock ?? 1,
        sku: p.sku || `SKU-${p.id}`,
        status: p.status || 'active',
        views: p.views || 1,
        inquiries: p.inquiries || 0,
        sales_count: p.salesCount || 0,
        featured: p.featured ?? false,
        specifications: p.specifications || {},
        updated_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        await sb.from('products').upsert(rows, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('Vercel API: Supabase save notice:', e);
    }
  }

  const payload = JSON.stringify({ products });
  try {
    await fetch(PRIMARY_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
  } catch {}
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const products = await fetchFromCloud();
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (body && Array.isArray(body.products)) {
        await saveToCloud(body.products);
        return res.status(200).json({ success: true, count: body.products.length });
      }

      const newProduct = body;
      if (!newProduct || !newProduct.title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const current = await fetchFromCloud();
      const updated = [newProduct, ...current.filter((p: any) => p.id !== newProduct.id)];
      await saveToCloud(updated);

      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const id = (req.query?.id as string) || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const callerEmail = ((req.headers['x-user-email'] as string) || req.body?.callerEmail || '').trim().toLowerCase();
      const current = await fetchFromCloud();
      const targetProduct = current.find((p: any) => p.id === id);

      if (!targetProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const adminEmail = 'godfredowusu370@gmail.com';
      const ownerEmail = (targetProduct.sellerEmail || '').trim().toLowerCase();

      // Ownership security verification
      if (callerEmail && callerEmail !== adminEmail && ownerEmail && callerEmail !== ownerEmail) {
        return res.status(403).json({ error: 'Unauthorized: You do not have permission to edit this product.' });
      }

      const updates = req.body;
      const sb = getSupabaseClient();
      if (sb && id) {
        try {
          const supaUpdate: any = { updated_at: new Date().toISOString() };
          if (updates.title !== undefined) supaUpdate.title = updates.title;
          if (updates.price !== undefined) supaUpdate.price = updates.price;
          if (updates.category !== undefined) supaUpdate.category = updates.category;
          if (updates.subcategory !== undefined) supaUpdate.subcategory = updates.subcategory;
          if (updates.region !== undefined) supaUpdate.region = updates.region;
          if (updates.city !== undefined) supaUpdate.city = updates.city;
          if (updates.condition !== undefined) supaUpdate.condition = updates.condition;
          if (updates.images !== undefined) supaUpdate.images = updates.images;
          if (updates.description !== undefined) supaUpdate.description = updates.description;
          if (updates.stock !== undefined) supaUpdate.stock = updates.stock;
          if (updates.status !== undefined) supaUpdate.status = updates.status;
          if (updates.negotiable !== undefined) supaUpdate.negotiable = updates.negotiable;
          if (updates.sellerName !== undefined) supaUpdate.seller_name = updates.sellerName;
          if (updates.sellerPhone !== undefined) supaUpdate.seller_phone = updates.sellerPhone;
          if (updates.specifications !== undefined) supaUpdate.specifications = updates.specifications;

          await sb.from('products').update(supaUpdate).eq('id', id);
        } catch (e) {
          console.warn('Vercel API: Supabase update exception:', e);
        }
      }

      const updated = current.map((p: any) => (p.id === id ? { ...p, ...updates } : p));
      await saveToCloud(updated);

      return res.status(200).json({ success: true, id, product: { ...targetProduct, ...updates } });
    }

    if (req.method === 'DELETE') {
      const id = (req.query?.id as string) || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const callerEmail = ((req.headers['x-user-email'] as string) || (req.query?.callerEmail as string) || req.body?.callerEmail || '').trim().toLowerCase();
      const current = await fetchFromCloud();
      const targetProduct = current.find((p: any) => p.id === id);

      if (!targetProduct) {
        return res.status(200).json({ success: true, id, message: 'Product already deleted' });
      }

      const adminEmail = 'godfredowusu370@gmail.com';
      const ownerEmail = (targetProduct.sellerEmail || '').trim().toLowerCase();

      // Ownership security verification
      if (callerEmail && callerEmail !== adminEmail && ownerEmail && callerEmail !== ownerEmail) {
        return res.status(403).json({ error: 'Unauthorized: You do not have permission to delete this product.' });
      }

      const sb = getSupabaseClient();
      if (sb && id) {
        try {
          await sb.from('products').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id);
          await sb.from('products').delete().eq('id', id);
        } catch (e) {
          console.warn('Vercel API: Supabase delete exception:', e);
        }
      }

      const updated = current.filter((p: any) => p.id !== id);
      await saveToCloud(updated);

      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
