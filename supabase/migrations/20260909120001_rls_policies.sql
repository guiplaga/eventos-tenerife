-- Politicas RLS.
--
-- venues / sources: lectura publica (necesaria para mostrar el evento y
-- atribuir su fuente original). Escritura solo via service_role (worker de
-- ingesta y Table Editor de Supabase), que ignora RLS por diseno.
--
-- events: lectura publica SOLO de eventos revisados (reviewed = true). Este
-- es el punto de la aplicacion donde vive la compuerta de curacion humana:
-- aunque un conector de scraping meta basura, nunca es visible hasta que
-- alguien la revisa manualmente. La ingesta y la revision usan service_role.
--
-- favorites: cada usuario autenticado solo ve/gestiona sus propios favoritos.

alter table venues enable row level security;
create policy "venues_public_read" on venues
  for select using (true);

alter table sources enable row level security;
create policy "sources_public_read" on sources
  for select using (true);

alter table events enable row level security;
create policy "events_public_read" on events
  for select using (reviewed = true);

alter table favorites enable row level security;
create policy "favorites_select_own" on favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on favorites
  for delete using (auth.uid() = user_id);
