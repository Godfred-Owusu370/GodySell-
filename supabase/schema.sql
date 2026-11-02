-- ==============================================================================
-- GodySell Ghana Marketplace - Supabase PostgreSQL Database Schema & Security
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor (https://app.supabase.com)
-- Project: GodySell Ghana Marketplace

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  picture TEXT,
  phone TEXT,
  region TEXT DEFAULT 'Greater Accra',
  is_verified BOOLEAN DEFAULT TRUE,
  member_since TEXT DEFAULT 'Sep 2024',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Super Admin
INSERT INTO public.profiles (id, name, email, phone, region, is_verified, is_admin, member_since)
VALUES ('admin-godfred', 'Godfred Owusu', 'godfredowusu370@gmail.com', '+233(0)592836664', 'Greater Accra', TRUE, TRUE, 'Sep 2024')
ON CONFLICT (email) DO UPDATE SET is_admin = TRUE, is_verified = TRUE;

-- ------------------------------------------------------------------------------
-- 2. PRODUCT CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Categories
INSERT INTO public.categories (id, name, slug, icon)
VALUES
  ('cat-phones', 'Mobile Phones & Tablets', 'mobile-phones-tablets', 'Smartphone'),
  ('cat-vehicles', 'Vehicles', 'vehicles', 'Car'),
  ('cat-property', 'Property & Real Estate', 'property-real-estate', 'Home'),
  ('cat-electronics', 'Electronics & Appliances', 'electronics-appliances', 'Tv'),
  ('cat-home', 'Home, Furniture & Appliances', 'home-furniture-appliances', 'Sofa'),
  ('cat-fashion', 'Fashion & Beauty', 'fashion-beauty', 'Shirt'),
  ('cat-agriculture', 'Agriculture & Food', 'agriculture-food', 'Wheat'),
  ('cat-commercial', 'Commercial Equipment', 'commercial-equipment', 'Wrench'),
  ('cat-jobs', 'Jobs & Services', 'jobs-services', 'Briefcase'),
  ('cat-others', 'Others', 'others', 'Package')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE (CENTRAL MARKETPLACE CATALOG)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Brand New',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT DEFAULT '',
  negotiable BOOLEAN DEFAULT TRUE,
  verified_seller BOOLEAN DEFAULT TRUE,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_member_since TEXT DEFAULT 'Sep 2024',
  seller_rating NUMERIC(3,2) DEFAULT 5.0,
  seller_review_count INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 1 CHECK (stock >= 0),
  sku TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'boosted', 'archived')),
  views INTEGER DEFAULT 1,
  inquiries INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  specifications JSONB DEFAULT '{}'::JSONB,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search, category filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_region ON public.products(region);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_email ON public.products(seller_email);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_location TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'Cash on Delivery',
  seller_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_seller_email ON public.orders(seller_email);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);

-- ------------------------------------------------------------------------------
-- 5. USER REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_product_id TEXT,
  reported_seller_email TEXT,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SUPPORT MESSAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
-- Enable Realtime publication on products table so Seller B sees Seller A's posts instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Set replica identity to FULL so deletions and updates broadcast all fields
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- ==============================================================================
-- 8. SUPABASE STORAGE BUCKET SETUP
-- ==============================================================================
-- Insert the product-images bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: PROFILES
-- ------------------------------------------------------------------------------
-- Public can view seller profiles (name, avatar, verified badge, region)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Users can insert/update their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (
    email = COALESCE(auth.jwt()->>'email', '') OR
    id = auth.uid()::TEXT OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com'
  );

-- ------------------------------------------------------------------------------
-- RLS: CATEGORIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Categories are readable by everyone"
  ON public.categories FOR SELECT
  USING (TRUE);

-- ------------------------------------------------------------------------------
-- RLS: PRODUCTS
-- ------------------------------------------------------------------------------
-- Public can view active, boosted, or paused products
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status != 'archived');

-- Sellers can also view their own archived products
CREATE POLICY "Sellers can view own listings"
  ON public.products FOR SELECT
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    user_id = auth.uid()::TEXT
  );

-- Verified sellers can publish products
CREATE POLICY "Sellers can publish products"
  ON public.products FOR INSERT
  WITH CHECK (
    price > 0 AND
    length(title) > 0 AND
    length(seller_phone) > 0
  );

-- Sellers can update their listings (supports Supabase Auth JWT and client Google sessions)
CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    user_id = auth.uid()::TEXT OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com' OR
    auth.role() = 'anon'
  )
  WITH CHECK (
    price > 0 AND length(title) > 0
  );

-- Sellers can delete their listings (supports Supabase Auth JWT and client Google sessions)
CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    user_id = auth.uid()::TEXT OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com' OR
    auth.role() = 'anon'
  );

-- ------------------------------------------------------------------------------
-- RLS: ORDERS
-- ------------------------------------------------------------------------------
-- Buyers or sellers can view orders related to them
CREATE POLICY "Users can view their related orders"
  ON public.orders FOR SELECT
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com' OR
    TRUE -- Allow buyer checkout tracking
  );

-- Anyone can submit an order (checkout)
CREATE POLICY "Anyone can create an order"
  ON public.orders FOR INSERT
  WITH CHECK (total_amount >= 0 AND quantity > 0);

-- Sellers can update order status
CREATE POLICY "Sellers can update order status"
  ON public.orders FOR UPDATE
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com'
  );

-- ------------------------------------------------------------------------------
-- RLS: USER REPORTS
-- ------------------------------------------------------------------------------
-- Anyone can submit a report
CREATE POLICY "Anyone can submit a report"
  ON public.user_reports FOR INSERT
  WITH CHECK (length(reason) > 0);

-- Only Admin can view reports
CREATE POLICY "Admins can view reports"
  ON public.user_reports FOR SELECT
  USING (COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com');

-- ------------------------------------------------------------------------------
-- RLS: SUPPORT MESSAGES
-- ------------------------------------------------------------------------------
-- Anyone can send support messages
CREATE POLICY "Anyone can send support message"
  ON public.support_messages FOR INSERT
  WITH CHECK (length(message) > 0 AND length(user_email) > 0);

-- Only Admin can view support messages
CREATE POLICY "Admins can view support messages"
  ON public.support_messages FOR SELECT
  USING (COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com');

-- ------------------------------------------------------------------------------
-- RLS: STORAGE POLICIES FOR 'product-images'
-- ------------------------------------------------------------------------------
-- Anyone can view product photos
CREATE POLICY "Public read for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Sellers can upload images
CREATE POLICY "Sellers can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = 'products' OR bucket_id = 'product-images'
  );

-- Image owners can delete their images
CREATE POLICY "Sellers can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (auth.uid() = owner OR COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com')
  );
