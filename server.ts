import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_FILE = path.resolve(__dirname, 'data', 'products.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

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

async function fetchFromCloudRemote(): Promise<any[]> {
  const cacheBuster = `?t=${Date.now()}`;
  try {
    const res = await fetch(`${PRIMARY_CLOUD_DB_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store', Accept: 'application/json' }
    });
    if (res.ok) {
      const data: any = await res.json();
      const list = Array.isArray(data?.products) ? data.products : [];
      return list.filter(isRealProduct);
    }
  } catch (e) {
    console.warn('Server: Primary cloud fetch failed:', e);
  }

  try {
    const res = await fetch(`${BACKUP_CLOUD_DB_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store', Accept: 'application/json' }
    });
    if (res.ok) {
      const data: any = await res.json();
      const list = Array.isArray(data?.products) ? data.products : [];
      return list.filter(isRealProduct);
    }
  } catch (e) {
    console.warn('Server: Backup cloud fetch failed:', e);
  }

  return [];
}

async function pushToCloudRemote(products: any[]) {
  const clean = products.filter(isRealProduct);
  const payload = JSON.stringify({ products: clean });
  try {
    await fetch(PRIMARY_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
  } catch (e) {
    console.warn('Server: Primary push failed:', e);
  }

  try {
    await fetch(BACKUP_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
  } catch (e) {
    console.warn('Server: Backup push failed:', e);
  }
}

// Memory cache & helper functions
function readProducts(): any[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRealProduct) : [];
  } catch (err) {
    console.error('Error reading products file:', err);
    return [];
  }
}

function writeProducts(products: any[]) {
  try {
    const clean = products.filter(isRealProduct);
    fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing products file:', err);
  }
}

// SSE Client list
const sseClients = new Set<Response>();

function broadcastProducts(products: any[]) {
  const clean = products.filter(isRealProduct);
  const payload = `data: ${JSON.stringify(clean)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 20s for mobile connections
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS & Real-time No-Cache Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const local = readProducts();
    const remote = await fetchFromCloudRemote();

    // Merge by ID, keeping all genuine listings
    const map = new Map<string, any>();
    for (const p of remote) {
      if (isRealProduct(p)) map.set(p.id, p);
    }
    for (const p of local) {
      if (isRealProduct(p) && !map.has(p.id)) {
        map.set(p.id, p);
      }
    }

    const merged = Array.from(map.values());
    if (merged.length !== local.length) {
      writeProducts(merged);
    }

    res.json(merged);
  } catch {
    res.json(readProducts());
  }
});

// Real-Time Server-Sent Events (SSE) Stream
// Every phone/device listening to this stream immediately receives all new products and changes
app.get('/api/products/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send current products immediately upon connecting
  const current = readProducts();
  res.write(`data: ${JSON.stringify(current)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (body && Array.isArray(body.products)) {
      const clean = body.products.filter(isRealProduct);
      writeProducts(clean);
      broadcastProducts(clean);
      pushToCloudRemote(clean).catch(() => {});
      return res.status(200).json({ success: true, count: clean.length });
    }

    const productData = body;
    if (!productData || !productData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const localProducts = readProducts();
    const newProduct = {
      ...productData,
      id: productData.id || `prod-${Date.now().toString().slice(-6)}`,
      createdAt: productData.createdAt || new Date().toISOString(),
      views: productData.views || 1,
      inquiries: productData.inquiries || 0,
      salesCount: productData.salesCount || 0
    };

    // Prepend so newest appears first
    const updated = [newProduct, ...localProducts.filter((p: any) => p.id !== newProduct.id)];
    writeProducts(updated);
    broadcastProducts(updated);

    // Push to cloud remote in background
    pushToCloudRemote(updated).catch(() => {});

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.post('/api/products/sync-all', (req: Request, res: Response) => {
  try {
    const products = req.body;
    if (Array.isArray(products)) {
      writeProducts(products);
      broadcastProducts(products);
      return res.json({ success: true, count: products.length });
    }
    res.status(400).json({ error: 'Array expected' });
  } catch (error) {
    console.error('Failed to sync-all products:', error);
    res.status(500).json({ error: 'Failed to sync-all' });
  }
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const products = readProducts();
    const index = products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = { ...products[index], ...updates };
    writeProducts(products);
    broadcastProducts(products);

    res.json(products[index]);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = readProducts();
    const updated = products.filter((p: any) => p.id !== id);

    writeProducts(updated);
    broadcastProducts(updated);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Mount Vite or static frontend
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Explicit SEO static assets
  app.get('/robots.txt', (req: Request, res: Response) => {
    const robotsPath = path.resolve(__dirname, isProd ? 'dist/robots.txt' : 'public/robots.txt');
    res.type('text/plain').sendFile(robotsPath);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const sitemapPath = path.resolve(__dirname, isProd ? 'dist/sitemap.xml' : 'public/sitemap.xml');
    res.type('application/xml').sendFile(sitemapPath);
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GodySell Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
