-- =====================================================================
-- Zippi Backend v2 — MIGRATION for an EXISTING Supabase project
-- Run this ONCE in the Supabase SQL Editor. It is idempotent and
-- preserves all existing data (users, products, categories, orders…).
-- =====================================================================

-- users: account state + avatar
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- categories: image + ordering + hierarchy
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_slug TEXT REFERENCES public.categories(slug) ON UPDATE CASCADE;

-- products: variants configuration
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- orders: delivery timestamp
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- rider_profiles: vehicle info + rating
ALTER TABLE public.rider_profiles ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'bike';
ALTER TABLE public.rider_profiles ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.0;

-- orders: promo code used
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- promotions: promo/discount codes
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- settings: key-value store for store/delivery configuration
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- order_events: audit trail of order status changes
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Default settings rows (no-op if they already exist)
INSERT INTO public.settings (key, value) VALUES
  ('store', '{"name":"Zippi","currency":"AED","supportPhone":"","supportEmail":"","isOpen":true}'::jsonb),
  ('delivery', '{"deliveryFee":4.99,"freeDeliveryAbove":99,"etaMinutes":30,"serviceRadiusKm":15}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Promotions table: advanced promo rules
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'order' CHECK (scope IN ('order', 'category', 'product', 'delivery', 'payment'));
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_category_slug TEXT REFERENCES public.categories(slug) ON UPDATE CASCADE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_payment_method TEXT CHECK (target_payment_method IN ('COD', 'CARD'));
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT FALSE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS start_hour INTEGER CHECK (start_hour >= 0 AND start_hour <= 23);
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS end_hour INTEGER CHECK (end_hour >= 0 AND end_hour <= 23);

