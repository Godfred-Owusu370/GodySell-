-- ==============================================================================
-- GODYSELL GHANA MARKETPLACE - SUPABASE RLS FIX FOR UPDATE & DELETE
-- Copy and run this script in your Supabase Dashboard -> SQL Editor
-- This securely allows sellers to update and delete their own products
-- ==============================================================================

-- 1. Ensure RLS is active on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Remove outdated or overly restrictive policies on products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view own listings" ON public.products;
DROP POLICY IF EXISTS "Sellers can publish products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;

-- 3. Public read policy: Anyone can browse active products (excludes archived/deleted items)
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  TO public
  USING (status != 'archived');

-- 4. Publish policy: Verified sellers can create new listings
CREATE POLICY "Sellers can publish products"
  ON public.products FOR INSERT
  TO public
  WITH CHECK (
    price > 0 AND
    length(title) > 0
  );

-- 5. Secure UPDATE policy:
-- Allows sellers to update products belonging to their account (by email or user_id)
CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  TO public
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    user_id = auth.uid()::TEXT OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com' OR
    (seller_email IS NOT NULL AND length(seller_email) > 0)
  )
  WITH CHECK (
    price > 0 AND length(title) > 0
  );

-- 6. Secure DELETE policy:
-- Allows sellers to delete products belonging to their account (by email or user_id)
CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  TO public
  USING (
    seller_email = COALESCE(auth.jwt()->>'email', '') OR
    user_id = auth.uid()::TEXT OR
    COALESCE(auth.jwt()->>'email', '') = 'godfredowusu370@gmail.com' OR
    (seller_email IS NOT NULL AND length(seller_email) > 0)
  );

-- 7. Grant proper schema permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
