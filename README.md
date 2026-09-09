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
- [x] **Fase 1** — proyecto Supabase real creado, migraciones aplicadas (`venues`/`sources`/`events`/`favorites`
      + RLS) y 8 eventos de prueba cargados. Verificado: la API REST con `publishable` key devuelve 8
      eventos (RLS oculta el 9º, sin revisar); con `secret` key devuelve los 9.
- [x] **Fase 2** — `datos.canarias.es` descartado (CSV completo confirmado muerto: 5 filas totales,
      todas de 2021-2022). Primer conector real: **webtenerife.com** (`ingest/src/connectors/webtenerife.ts`),
      vía el endpoint JSON `pagecatalogueapi` que usa la propia web. Corrido contra el proyecto real:
      20 eventos insertados, categorizados y geolocalizados a municipio automaticamente, todos con
      `reviewed=false` (ocultos en la app publica hasta revision humana). Idempotente: segunda
      ejecucion no duplica ni pisa el estado de revision.
- [ ] Fase 3 — segundo conector de scraping + cron en GitHub Actions.

## Correr la app

```bash
cd ingest && npm install   # si no lo has hecho
cd ../app && npx expo start --web    # o `npx expo start` + Expo Go en un iPhone real
```

## Correr la ingesta

```bash
cd ingest
SUPABASE_URL=... SUPABASE_SECRET_KEY=... npx tsx src/index.ts
```

Los eventos nuevos entran con `reviewed=false` — hay que revisarlos en el Table Editor de Supabase
(corregir categoria/municipio si la heuristica se equivoco) antes de que la app publica los muestre.

## Supabase

Ver [`supabase/README.md`](supabase/README.md): crear el proyecto en el dashboard de supabase.com,
copiar `SUPABASE_URL`/`SUPABASE_ANON_KEY` a `.env` (ver `.env.example`), y aplicar las migraciones
con `supabase db push`.
