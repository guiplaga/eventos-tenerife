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
- [x] **Fase 3** — Tomaticket descartado (Cloudflare anti-bot) y el sistema de venta del Auditorio
      (Koobin) tambien bloquea peticiones automatizadas; ninguno de los dos se intenta esquivar.
      Segundo conector real: `canariasEvents.ts` (extrae JSON embebido en el HTML de canarias.events,
      con municipio y `ticket_url` ya resueltos). 91 eventos nuevos insertados; 7 duplicados cruzados
      con webtenerife detectados y reportados (todos correctamente a favor de la fuente con
      `ticket_url`, sin fusion automatica — lo decide quien revisa). Cron diario en
      `.github/workflows/ingest.yml` (05:00 UTC + disparo manual). **Pendiente de ti:** anadir los
      secrets `SUPABASE_URL`/`SUPABASE_SECRET_KEY` en GitHub (Settings > Secrets and variables >
      Actions) para que el cron funcione — no hay `gh` CLI instalado aqui para hacerlo yo.
- [x] **Fase 4** — navegacion con Expo Router: tabs Calendario/Buscar/Favoritos (`app/app/(tabs)/`).
      Calendario con `react-native-calendars` (mes con puntos en dias con eventos + lista del dia
      seleccionado), toggle mes/lista, chips de categoria. Datos reales desde Supabase (respeta RLS:
      solo eventos `reviewed=true`). Verificado en el navegador (modo web): fetch, filtro por
      categoria, toggle de vista y las 3 tabs funcionan sin errores de consola. Buscar/Favoritos son
      placeholders (logica real en Fase 6).

## Correr la app

Necesita `app/.env` (ver `app/.env.example`) con `EXPO_PUBLIC_SUPABASE_URL` y
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — mismos valores que el `.env` raiz.

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
