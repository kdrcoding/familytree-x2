-- ============================================================================
-- OPTIONAL hardening — run in Supabase SQL editor for project vwziwqqscpaqvudxdafw.
-- Family editors may INSERT relationships when adding a child/spouse, but only
-- the owner may UPDATE or DELETE relationship rows (structure changes / divorce).
-- ============================================================================

drop policy if exists "family update relationships" on public.family_relationships;

create policy "owner update relationships"
  on public.family_relationships for update
  to authenticated
  using (public.is_owner_account())
  with check (public.is_owner_account());
