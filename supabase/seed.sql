-- Datos de prueba (Fase 1). NO son datos reales scrapeados -- son eventos
-- inventados para poder construir y probar la UI de calendario/detalle antes
-- de que exista ningun conector de ingesta (Fase 2+).
--
-- Aplicar manualmente contra el proyecto real: `supabase db push` aplica las
-- migraciones pero NO ejecuta seed.sql contra un proyecto remoto. Para cargar
-- estos datos ahi, pega este archivo en el SQL Editor del dashboard, o usa
-- `supabase db reset` en local (requiere Docker).

insert into sources (id, nombre, tipo, url_base) values
  ('00000000-0000-0000-0000-000000000001', 'Carga manual (Fase 1)', 'opendata', null);

insert into venues (id, nombre, municipio, direccion, lat, lng) values
  ('00000000-0000-0000-0000-000000000101', 'Auditorio de Tenerife Adan Martin', 'Santa Cruz de Tenerife', 'Av. Constitucion, 1', 28.4586, -16.2354),
  ('00000000-0000-0000-0000-000000000102', 'Teatro Leal', 'La Laguna', 'Calle Obispo Rey Redondo, 34', 28.4874, -16.3159),
  ('00000000-0000-0000-0000-000000000103', 'TEA Tenerife Espacio de las Artes', 'Santa Cruz de Tenerife', 'Av. San Sebastian, 10', 28.4682, -16.2546),
  ('00000000-0000-0000-0000-000000000104', 'Plaza del Charco', 'Puerto de la Cruz', 'Plaza del Charco', 28.4130, -16.5470),
  ('00000000-0000-0000-0000-000000000105', 'Playa de Fanabe', 'Adeje', 'Av. Bruselas', 28.0876, -16.7423);

insert into events (
  source_id, external_id, title, description, category,
  start_at, end_at, all_day, venue_id, municipality,
  image_url, source_url, ticket_required, ticket_url, ticket_provider,
  price_from, status, reviewed
) values
  (
    '00000000-0000-0000-0000-000000000001', 'seed-001',
    'Concierto Sinfonica de Tenerife', 'Programa de otono de la Orquesta Sinfonica de Tenerife.',
    'concierto', '2026-11-14 20:00:00Z', '2026-11-14 22:00:00Z', false,
    '00000000-0000-0000-0000-000000000101', 'Santa Cruz de Tenerife',
    null, 'https://auditoriodetenerife.com', true, 'https://example.com/tickets/seed-001', 'tomaticket',
    18.00, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-002',
    'Fuegos artificiales - Fiestas de Mayo', 'Castillo de fuegos artificiales en la bahia de Santa Cruz.',
    'fuegos_artificiales', '2026-05-03 22:30:00Z', null, false,
    null, 'Santa Cruz de Tenerife',
    null, 'https://santacruzdetenerife.es', false, null, null,
    null, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-003',
    'Romeria de San Benito Abad', 'Romeria tradicional con carros engalanados y trajes tipicos.',
    'fiesta_popular', '2026-11-05 11:00:00Z', '2026-11-05 20:00:00Z', true,
    null, 'La Laguna',
    null, 'https://webtenerife.com', false, null, null,
    null, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-004',
    '"Bodas de Sangre" de Lorca', 'Reposicion del clasico de Federico Garcia Lorca.',
    'teatro', '2026-11-20 20:30:00Z', '2026-11-20 22:15:00Z', false,
    '00000000-0000-0000-0000-000000000102', 'La Laguna',
    null, 'https://tomaticket.es', true, 'https://example.com/tickets/seed-004', 'tomaticket',
    12.00, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-005',
    'Gravedad y orbita', 'Exposicion de arte contemporaneo sobre astronomia insular.',
    'exposicion', '2026-10-01 10:00:00Z', '2027-01-15 20:00:00Z', true,
    '00000000-0000-0000-0000-000000000103', 'Santa Cruz de Tenerife',
    null, 'https://teatenerife.es', false, null, null,
    null, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-006',
    'Mercadillo artesanal del Charco', 'Mercado de artesania local con musica en directo.',
    'familiar', '2026-11-08 10:00:00Z', '2026-11-08 14:00:00Z', false,
    '00000000-0000-0000-0000-000000000104', 'Puerto de la Cruz',
    null, 'https://wonderfultenerife.com', false, null, null,
    null, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-007',
    'Media maraton Costa Adeje', 'Carrera popular junto al litoral de Adeje.',
    'deporte', '2026-12-06 08:00:00Z', '2026-12-06 12:00:00Z', false,
    '00000000-0000-0000-0000-000000000105', 'Adeje',
    null, 'https://adeje.es', true, 'https://example.com/tickets/seed-007', 'ticketmaster',
    15.00, 'active', true
  ),
  (
    '00000000-0000-0000-0000-000000000001', 'seed-008',
    'Feria de la Ropa Vieja', 'Muestra gastronomica de platos tradicionales canarios.',
    'gastronomia', '2026-11-22 12:00:00Z', '2026-11-22 22:00:00Z', false,
    null, 'La Laguna',
    null, 'https://canarias.events', false, null, null,
    null, 'postponed', true
  );

-- Un noveno evento sin revisar, para poder verificar que la politica RLS
-- (events_public_read) lo oculta correctamente con la anon key.
insert into events (
  source_id, external_id, title, description, category,
  start_at, all_day, municipality, source_url, status, reviewed
) values (
  '00000000-0000-0000-0000-000000000001', 'seed-009-sin-revisar',
  'Evento pendiente de revision', 'No deberia aparecer en la app publica.',
  'otro', '2026-12-01 18:00:00Z', false, 'Tegueste', 'https://example.com', 'active', false
);
