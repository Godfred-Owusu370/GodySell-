import {
  fetchOnlineProducts,
  publishProductToCloud,
  deleteProductFromCloud
} from '../src/services/productDatabase';
import { Product } from '../src/types';

async function runTest() {
  console.log('--- TEST: Cross-device Product Synchronization ---');

  // 1. Initial count
  const initialProducts = await fetchOnlineProducts();
  console.log('Initial online product count:', initialProducts.length);

  // 2. Account A publishes a product
  const testProduct: Product = {
    id: `prod-test-${Date.now()}`,
    title: 'Samsung Galaxy S24 Ultra Titanium Black',
    price: 13500,
    category: 'Mobile Phones & Tablets',
    subcategory: 'Mobile Phones',
    region: 'Greater Accra',
    city: 'East Legon',
    condition: 'Brand New',
    stock: 3,
    sku: 'SKU-S24U-01',
    negotiable: true,
    description: 'Factory sealed Samsung Galaxy S24 Ultra 256GB Dual SIM with full 1 year warranty.',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80'],
    sellerName: 'Kwesi Mobile Hub',
    sellerPhone: '+233 24 555 1234',
    sellerEmail: 'seller_a@example.com',
    sellerMemberSince: 'Oct 2024',
    sellerRating: 4.9,
    sellerReviewCount: 12,
    verifiedSeller: true,
    status: 'active',
    featured: true,
    views: 1,
    inquiries: 0,
    salesCount: 0,
    specifications: {},
    createdAt: new Date().toISOString()
  };

  console.log('Account A (seller_a@example.com) publishing product:', testProduct.title);
  await publishProductToCloud(testProduct);

  // 3. Account B on a "different device" fetches from the shared online cloud database
  console.log('Account B (buyer_b@gmail.com on Device 2) fetching catalog from online cloud DB...');
  const device2Products = await fetchOnlineProducts();
  console.log('device2Products received:', JSON.stringify(device2Products));

  const foundOnDevice2 = device2Products.find(p => p.id === testProduct.id);
  if (foundOnDevice2) {
    console.log('SUCCESS: Product published by Account A was successfully fetched by Device 2!');
    console.log('Found product:', foundOnDevice2.title, 'Price: GH₵' + foundOnDevice2.price, 'Seller:', foundOnDevice2.sellerEmail);
  } else {
    console.error('FAIL: Product not found on Device 2');
    process.exit(1);
  }

  // 4. Clean up test product
  console.log('Cleaning up test product...');
  await deleteProductFromCloud(testProduct.id);
  const finalProducts = await fetchOnlineProducts();
  console.log('Final online product count after cleanup:', finalProducts.length);
  console.log('--- ALL CROSS-DEVICE TESTS PASSED ---');
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
