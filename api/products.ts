// Vercel Serverless Function for /api/products
// Synchronizes with the shared persistent online cloud database
const CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/abfaaea';

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
      const response = await fetch(CLOUD_DB_URL);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch cloud products' });
      }
      const json = await response.json();
      const products = Array.isArray(json?.products) ? json.products : [];
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const newProduct = req.body;
      const getRes = await fetch(CLOUD_DB_URL);
      const getJson = await getRes.json();
      const current = Array.isArray(getJson?.products) ? getJson.products : [];
      const updated = [newProduct, ...current.filter((p: any) => p.id !== newProduct.id)];

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updated })
      });

      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;
      const getRes = await fetch(CLOUD_DB_URL);
      const getJson = await getRes.json();
      const current = Array.isArray(getJson?.products) ? getJson.products : [];
      const updated = current.map((p: any) => (p.id === id ? { ...p, ...updates } : p));

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updated })
      });

      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const getRes = await fetch(CLOUD_DB_URL);
      const getJson = await getRes.json();
      const current = Array.isArray(getJson?.products) ? getJson.products : [];
      const updated = current.filter((p: any) => p.id !== id);

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updated })
      });

      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
