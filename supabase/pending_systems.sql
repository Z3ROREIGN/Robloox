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


-- Complete product/community systems hardening
create unique index if not exists store_wishlist_items_unique_idx on public.store_wishlist_items(wishlist_id,product_id);
create index if not exists delivery_events_order_created_idx on public.store_delivery_events(order_id,created_at desc);
create index if not exists product_questions_product_created_idx on public.store_product_questions(product_id,created_at desc);
create index if not exists product_reviews_product_created_idx on public.product_reviews(product_id,created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

alter table public.store_delivery_events enable row level security;
drop policy if exists delivery_events_order_owner on public.store_delivery_events;
create policy delivery_events_order_owner on public.store_delivery_events for select to authenticated
using (exists(select 1 from public.store_orders o where o.id=store_delivery_events.order_id and (o.user_id=auth.uid() or is_admin(auth.uid()))));

create or replace function public.ensure_default_wishlist() returns uuid language plpgsql security definer set search_path=public as $$
declare wid uuid;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 select id into wid from public.store_wishlists where user_id=auth.uid() order by created_at limit 1;
 if wid is null then insert into public.store_wishlists(user_id,name) values(auth.uid(),'Minha lista') returning id into wid; end if;
 return wid;
end $$;
revoke all on function public.ensure_default_wishlist() from public;
grant execute on function public.ensure_default_wishlist() to authenticated;

create or replace function public.create_referral_code() returns public.store_referrals language plpgsql security definer set search_path=public as $$
declare row public.store_referrals; code text;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 select * into row from public.store_referrals where referrer_id=auth.uid() and referred_id is null order by created_at limit 1;
 if row.id is not null then return row; end if;
 loop
  code := upper(substr(encode(gen_random_bytes(6),'hex'),1,10));
  exit when not exists(select 1 from public.store_referrals where store_referrals.code=code);
 end loop;
 insert into public.store_referrals(referrer_id,code,reward_amount,status) values(auth.uid(),code,0,'pending') returning * into row;
 return row;
end $$;
revoke all on function public.create_referral_code() from public;
grant execute on function public.create_referral_code() to authenticated;

create or replace function public.claim_referral_code(p_code text) returns boolean language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 select id into rid from public.store_referrals where upper(code)=upper(trim(p_code)) and referred_id is null and referrer_id<>auth.uid() order by created_at limit 1 for update;
 if rid is null then return false; end if;
 update public.store_referrals set referred_id=auth.uid(),status='completed' where id=rid;
 return true;
end $$;
revoke all on function public.claim_referral_code(text) from public,anon;
grant execute on function public.claim_referral_code(text) to authenticated;

create or replace function public.validate_product_review() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.store_orders o join public.store_order_items i on i.order_id=o.id where o.id=new.order_id and o.user_id=new.user_id and o.status='delivered' and i.product_id=new.product_id) then raise exception 'review_requires_delivered_order'; end if;
 if new.rating < 1 or new.rating > 5 then raise exception 'invalid_rating'; end if;
 if char_length(trim(coalesce(new.body,''))) < 3 or char_length(new.body) > 1000 then raise exception 'invalid_review_body'; end if;
 return new;
end $$;
revoke execute on function public.validate_product_review() from public,anon,authenticated;
drop trigger if exists product_reviews_validate on public.product_reviews;
create trigger product_reviews_validate before insert or update on public.product_reviews for each row execute function public.validate_product_review();
