-- Coordenadas del evento (cuando la fuente las da), para el mapa de la
-- Fase 5. Nullable: no todas las fuentes las traen (canarias_events solo da
-- municipio/venue como texto, sin lat/lng).
alter table events
  add column lat double precision,
  add column lng double precision;
