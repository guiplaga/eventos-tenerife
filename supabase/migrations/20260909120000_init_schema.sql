-- Esquema inicial: venues, sources, events, favorites.
-- Ver plan-app-eventos-tenerife.md seccion 4 (Modelo de datos).

create type event_category as enum (
  'festival',
  'fuegos_artificiales',
  'teatro',
  'concierto',
  'fiesta_popular',
  'exposicion',
  'familiar',
  'deporte',
  'gastronomia',
  'otro'
);

create type event_status as enum ('active', 'cancelled', 'postponed');

create type source_type as enum ('api', 'opendata', 'scrape');

create table venues (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  municipio text,
  direccion text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo source_type not null,
  url_base text,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id),
  external_id text not null,
  title text not null,
  description text,
  category event_category not null default 'otro',
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  venue_id uuid references venues(id),
  municipality text,
  image_url text,
  source_url text not null,
  ticket_required boolean not null default false,
  ticket_url text,
  ticket_provider text,
  price_from numeric(10, 2),
  status event_status not null default 'active',
  -- true solo cuando un humano ha confirmado categoria/fecha/lugar.
  -- la app publica (RLS) solo muestra reviewed = true.
  reviewed boolean not null default false,
  hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create index events_start_at_idx on events (start_at);
create index events_category_idx on events (category);
create index events_municipality_idx on events (municipality);

create table favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

-- Mantiene updated_at al dia en cada upsert de la ingesta.
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_set_updated_at
  before update on events
  for each row
  execute function set_updated_at();
