-- Rooblox production upgrade schema
-- Apply in Supabase SQL Editor before enabling the optional server-backed features.
create table if not exists public.product_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
create table if not exists public.store_coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent','fixed')),
  value numeric(12,2) not null check (value > 0),
  min_total numeric(12,2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.store_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists product_favorites_user_idx on public.product_favorites(user_id);
create index if not exists product_reviews_product_idx on public.product_reviews(product_id);
create index if not exists notifications_user_idx on public.store_notifications(user_id, created_at desc);

alter table public.product_favorites enable row level security;
alter table public.product_reviews enable row level security;
alter table public.store_notifications enable row level security;
alter table public.store_coupons enable row level security;

create policy "favorites own rows" on public.product_favorites for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "reviews public read" on public.product_reviews for select using (true);
create policy "reviews own write" on public.product_reviews for insert with check (auth.uid()=user_id);
create policy "reviews own update" on public.product_reviews for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "notifications own rows" on public.store_notifications for select using (auth.uid()=user_id);
create policy "notifications own update" on public.store_notifications for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "coupon public read active" on public.store_coupons for select using (active=true);
