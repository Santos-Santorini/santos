-- Applied to jmnuuekizaljlqdeupqr on 2026-10-03 through Dashboard SQL Editor.
-- The application manages orders and integrations using server-side service_role.
-- Deploy lib/blog/store.ts alongside this change so admin lists can read drafts.
begin;
alter extension pg_trgm set schema extensions;
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;
revoke all on public.orders, public.integration_ananas_discount_state,
  public.integration_ananas_product_state, public.integration_sync_runs,
  public.integration_sync_items, public.integration_stock_delta_state,
  public.integration_stock_raw_files, public.integration_stock_raw_rows,
  public.integration_stock_sync_log from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter policy anon_read on public.catalog_products to anon, authenticated
  using (is_active and is_exported);
alter policy anon_read on public.catalog_product_media to anon, authenticated
  using (exists (select 1 from public.catalog_products p
    where p.legacy_id = catalog_product_media.legacy_product_id
      and p.is_active and p.is_exported));
alter policy anon_read on public.content_posts to anon, authenticated
  using (is_published);
alter policy anon_read on public.content_post_category_links to anon, authenticated
  using (exists (select 1 from public.content_posts p
    where p.id = content_post_category_links.post_id and p.is_published));
commit;
