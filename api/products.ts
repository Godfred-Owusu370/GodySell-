// Vercel Serverless Function for /api/products
// Synchronizes with the dual persistent online cloud database
const PRIMARY_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/abfaaea';
const BACKUP_CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/adabcaa';

async function fetchFromCloud() {
  try {
    const res = await fetch(PRIMARY_CLOUD_DB_URL);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data?.products) ? data.products : [];
    }
  } catch (e) {
    console.warn('Vercel API: Primary fetch failed:', e);
  }

  try {
    const res = await fetch(BACKUP_CLOUD_DB_URL);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data?.products) ? data.products : [];
    }
  } catch (e) {
    console.warn('Vercel API: Backup fetch failed:', e);
  }

  return [];
}

async function saveToCloud(products: any[]) {
  const payload = JSON.stringify({ products });
  let saved = false;

  try {
    const res = await fetch(PRIMARY_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    if (res.ok) saved = true;
  } catch (e) {
    console.warn('Vercel API: Primary save failed:', e);
  }

  try {
    const res = await fetch(BACKUP_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    if (res.ok) saved = true;
  } catch (e) {
    console.warn('Vercel API: Backup save failed:', e);
  }

  if (!saved) {
    throw new Error('Could not persist catalog to cloud databases');
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const products = await fetchFromCloud();
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const newProduct = req.body;
      if (!newProduct || !newProduct.title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const current = await fetchFromCloud();
      const updated = [newProduct, ...current.filter((p: any) => p.id !== newProduct.id)];
      await saveToCloud(updated);

      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;
      const current = await fetchFromCloud();
      const updated = current.map((p: any) => (p.id === id ? { ...p, ...updates } : p));
      await saveToCloud(updated);

      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const current = await fetchFromCloud();
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
