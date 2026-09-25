-- Production foundations for the previously pending systems.
create table if not exists public.user_favorites (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(user_id,product_id)
);
create index if not exists user_favorites_user_idx on public.user_favorites(user_id,created_at desc);

create table if not exists public.store_wishlists (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null default 'Minha lista',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.store_wishlist_items (
 id uuid primary key default gen_random_uuid(),
 wishlist_id uuid not null references public.store_wishlists(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(wishlist_id,product_id)
);
create index if not exists wishlist_items_wishlist_idx on public.store_wishlist_items(wishlist_id,created_at desc);

create table if not exists public.store_referrals (
 id uuid primary key default gen_random_uuid(),
 referrer_id uuid not null references auth.users(id) on delete cascade,
 referred_id uuid references auth.users(id) on delete set null,
 code text not null unique,
 reward_amount numeric(12,2) not null default 0,
 status text not null default 'pending',
 created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.store_referrals(referrer_id,created_at desc);

create table if not exists public.store_product_questions (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 question text not null,
 answer text,
 answered_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 answered_at timestamptz
);
create index if not exists product_questions_product_idx on public.store_product_questions(product_id,created_at desc);

create table if not exists public.store_coupon_redemptions (
 id uuid primary key default gen_random_uuid(),
 coupon_id uuid references public.coupons(id) on delete set null,
 user_id uuid not null references auth.users(id) on delete cascade,
 order_id uuid references public.store_orders(id) on delete set null,
 discount numeric(12,2) not null default 0,
 created_at timestamptz not null default now(),
 unique(coupon_id,user_id,order_id)
);
create index if not exists coupon_redemptions_order_idx on public.store_coupon_redemptions(order_id,created_at desc);

create table if not exists public.store_delivery_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.store_orders(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 status text not null,
 note text,
 created_at timestamptz not null default now()
);
create index if not exists delivery_events_order_idx on public.store_delivery_events(order_id,created_at desc);

alter table public.user_favorites enable row level security;
alter table public.store_wishlists enable row level security;
alter table public.store_wishlist_items enable row level security;
alter table public.store_referrals enable row level security;
alter table public.store_product_questions enable row level security;
alter table public.store_coupon_redemptions enable row level security;
alter table public.store_delivery_events enable row level security;

drop policy if exists user_favorites_own on public.user_favorites;
create policy user_favorites_own on public.user_favorites for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists wishlists_own on public.store_wishlists;
create policy wishlists_own on public.store_wishlists for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists wishlist_items_own on public.store_wishlist_items;
create policy wishlist_items_own on public.store_wishlist_items for all to authenticated using (exists(select 1 from public.store_wishlists w where w.id=wishlist_id and w.user_id=(select auth.uid()))) with check (exists(select 1 from public.store_wishlists w where w.id=wishlist_id and w.user_id=(select auth.uid())));
drop policy if exists questions_read on public.store_product_questions;
create policy questions_read on public.store_product_questions for select to anon,authenticated using (true);
drop policy if exists questions_insert_own on public.store_product_questions;
create policy questions_insert_own on public.store_product_questions for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists referrals_own on public.store_referrals;
create policy referrals_own on public.store_referrals for select to authenticated using ((select auth.uid())=referrer_id or (select auth.uid())=referred_id);
