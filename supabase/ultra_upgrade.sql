-- Rooblox Ultra Suite production upgrade
-- Applied to the connected Supabase project and kept here for reproducibility.
alter table public.user_notification_preferences add column if not exists theme_mode text not null default 'system' check (theme_mode in ('system','light','dark'));
create index if not exists support_tickets_user_updated_idx on public.support_tickets(user_id, updated_at desc);
create index if not exists support_messages_ticket_created_idx on public.support_messages(ticket_id, created_at);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index if not exists products_active_category_sort_idx on public.products(active, category_slug, sort_order);
create index if not exists product_reviews_product_created_idx on public.product_reviews(product_id, created_at desc);
create index if not exists product_favorites_user_created_idx on public.product_favorites(user_id, created_at desc);
drop policy if exists favorites_insert_own on public.product_favorites;
create policy favorites_insert_own on public.product_favorites for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists favorites_delete_own on public.product_favorites;
create policy favorites_delete_own on public.product_favorites for delete to authenticated using ((select auth.uid()) = user_id);
do $$ begin alter publication supabase_realtime add table public.support_messages; exception when duplicate_object then null; end $$;
