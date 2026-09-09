# Supabase

Contenido (Fase 1):

- `config.toml` — generado por `supabase init` (CLI v2).
- `migrations/20260909120000_init_schema.sql` — tablas `venues`, `sources`, `events`, `favorites`,
  enums (`event_category`, `event_status`, `source_type`) y el trigger de `updated_at`.
- `migrations/20260909120001_rls_policies.sql` — RLS: lectura publica de `venues`/`sources`,
  `events` publico solo si `reviewed = true` (compuerta de curacion humana), `favorites` restringido
  al propio usuario.
- `seed.sql` — 8 eventos de prueba (uno de cada categoria relevante) + 1 evento `reviewed = false`
  para verificar que la RLS lo oculta.

Estas migraciones **todavia no se han aplicado a ningun proyecto real** porque requieren tu cuenta de
Supabase (no puedo crearla ni iniciar sesion por ti). Pasos para activarlo:

```bash
# 1. Crea el proyecto en https://supabase.com/dashboard (tu cuenta, manualmente).

# 2. Instala el CLI (ya usado aqui via npx, no hace falta instalar global):
npx supabase login

# 3. Vincula este repo al proyecto remoto (pide el project-ref, esta en la URL del dashboard):
npx supabase link --project-ref <tu-project-ref>

# 4. Aplica las migraciones (crea las tablas + RLS):
npx supabase db push

# 5. Carga los datos de prueba (db push NO ejecuta seed.sql en remoto):
#    pega el contenido de seed.sql en el SQL Editor del dashboard, o:
npx supabase db execute -f seed.sql --linked
```

Copia `SUPABASE_URL` y la **`publishable` key** (Project Settings > API Keys — no la pestaña "Legacy
API Keys") a `.env` en la raiz del repo (ver `.env.example`). La **`secret` key** es solo para el
worker de `/ingest` — nunca va en la app ni en el chat, cópiala directo del dashboard a `.env`.

(Supabase esta migrando del formato antiguo `anon`/`service_role` JWT al nuevo `publishable`/`secret`.
Se comportan igual a efectos de RLS: `publishable` la respeta, `secret` la ignora — como antes
`anon`/`service_role`. Usa las nuevas salvo que el proyecto sea antiguo y solo tenga las legacy.)

## Verificar que RLS funciona

Con la `publishable` key (la que usara la app), una consulta a `events` debe devolver 8 filas, no 9 —
el evento `seed-009-sin-revisar` debe quedar oculto por la politica `events_public_read`. Con la
`secret` key (o desde el Table Editor) deben verse las 9.
