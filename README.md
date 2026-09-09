# Tenerife Eventos

App de calendario que agrega eventos de toda la isla de Tenerife y permite comprar entrada mediante
enlace al proveedor cuando aplica. Ver plan completo: `plan-app-eventos-tenerife.md` (Escritorio).

**Filosofia:** sencilla pero util. Cero backend propio, ticketing v1 = enlace saliente, nada de
sobreingenieria.

## Estructura

```
/app        Expo (React Native + TypeScript) - la app de iPhone
/ingest     Worker Node/TS con cron en GitHub Actions - un conector por fuente
/supabase   Migraciones SQL + config del CLI de Supabase (Postgres + API + Auth)
```

## Categorias (v1)

`festival · fuegos_artificiales · teatro · concierto · fiesta_popular · exposicion · familiar · deporte · gastronomia · otro`

Definidas en `ingest/src/types.ts`. La app (Fase 4) usa el mismo union type.

## Estado

- [x] **Fase 0** — Repo, estructura de carpetas, app Expo arrancando (verificado en modo web), worker
      de ingesta con dependencias instaladas.
- [x] **Fase 1 (SQL lista, sin aplicar)** — migraciones de `venues`/`sources`/`events`/`favorites` +
      RLS + `seed.sql` con 8 eventos de prueba. Ver [`supabase/README.md`](supabase/README.md) para
      los pasos pendientes (crear el proyecto en supabase.com, `supabase link`, `supabase db push`) —
      requieren tu cuenta, no las puedo hacer yo.
- [ ] Fase 2 — primer conector de ingesta (datos.canarias.es).

## Correr la app

```bash
cd ingest && npm install   # si no lo has hecho
cd ../app && npx expo start --web    # o `npx expo start` + Expo Go en un iPhone real
```

## Supabase

Ver [`supabase/README.md`](supabase/README.md): crear el proyecto en el dashboard de supabase.com,
copiar `SUPABASE_URL`/`SUPABASE_ANON_KEY` a `.env` (ver `.env.example`), y aplicar las migraciones
con `supabase db push`.
