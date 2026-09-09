import { createHash } from "node:crypto";
import type { Connector, NormalizedEvent } from "./types.js";
import { supabase } from "./lib/supabase.js";
import { webtenerifeConnector } from "./connectors/webtenerife.js";
import { canariasEventsConnector } from "./connectors/canariasEvents.js";

const connectors: Connector[] = [webtenerifeConnector, canariasEventsConnector];

function computeHash(e: NormalizedEvent): string {
  const relevant = {
    title: e.title,
    description: e.description,
    category: e.category,
    startAt: e.startAt,
    endAt: e.endAt,
    municipality: e.municipality,
    imageUrl: e.imageUrl,
    ticketUrl: e.ticketUrl,
    priceFrom: e.priceFrom,
    status: e.status,
  };
  return createHash("sha256").update(JSON.stringify(relevant)).digest("hex");
}

// Cada conector tiene una fila fija en `sources` (se crea si no existe).
async function ensureSourceId(name: string, tipo: "api" | "opendata" | "scrape", urlBase: string) {
  const { data: existing, error: selectError } = await supabase
    .from("sources")
    .select("id")
    .eq("nombre", name)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing.id as string;

  const { data: created, error: insertError } = await supabase
    .from("sources")
    .insert({ nombre: name, tipo, url_base: urlBase })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return created.id as string;
}

async function upsertEvents(sourceId: string, events: NormalizedEvent[]) {
  const { data: existingRows, error } = await supabase
    .from("events")
    .select("id, external_id, hash")
    .eq("source_id", sourceId);
  if (error) throw error;

  const existingByExternalId = new Map(
    (existingRows ?? []).map((row) => [row.external_id as string, row]),
  );

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const event of events) {
    const hash = computeHash(event);
    const existing = existingByExternalId.get(event.externalId);
    const row = {
      source_id: sourceId,
      external_id: event.externalId,
      title: event.title,
      description: event.description,
      category: event.category,
      start_at: event.startAt,
      end_at: event.endAt,
      all_day: event.allDay,
      municipality: event.municipality,
      image_url: event.imageUrl,
      source_url: event.sourceUrl,
      ticket_required: event.ticketRequired,
      ticket_url: event.ticketUrl,
      ticket_provider: event.ticketProvider,
      price_from: event.priceFrom,
      status: event.status,
      hash,
    };

    if (!existing) {
      // Evento nuevo: entra oculto (reviewed=false) hasta que un humano lo revise.
      const { error: insertError } = await supabase
        .from("events")
        .insert({ ...row, reviewed: false });
      if (insertError) throw insertError;
      inserted++;
    } else if (existing.hash !== hash) {
      // Evento existente con cambios: se actualiza el contenido pero NUNCA se
      // toca `reviewed` -- la curacion humana ya hecha no se pierde en cada re-ingesta.
      const { error: updateError } = await supabase.from("events").update(row).eq("id", existing.id);
      if (updateError) throw updateError;
      updated++;
    } else {
      unchanged++;
    }
  }

  return { inserted, updated, unchanged };
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Dedup real entre fuentes (plan seccion 5, paso 5: clave difusa
// titulo+dia+municipio, preferir la fuente con ticket_url) se resuelve en la
// revision humana, no automaticamente: se avisa aqui de los grupos
// sospechosos para que quien revise sepa cual de las filas marcar
// reviewed=true (la que tenga ticket_url) y cual dejar sin revisar.
async function reportCrossSourceDuplicates() {
  const { data: rows, error } = await supabase
    .from("events")
    .select("id, title, start_at, municipality, ticket_url, source_id, sources(nombre)")
    .eq("reviewed", false);
  if (error) throw error;
  if (!rows || rows.length === 0) return;

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${normalizeTitle(row.title)}|${String(row.start_at).slice(0, 10)}|${(row.municipality ?? "").toLowerCase()}`;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  const duplicates = [...groups.values()].filter(
    (group) => new Set(group.map((r) => r.source_id)).size > 1,
  );
  if (duplicates.length === 0) {
    console.log("Sin duplicados entre fuentes detectados.");
    return;
  }

  console.log(`\n${duplicates.length} posible(s) duplicado(s) entre fuentes (pendientes de revision):`);
  for (const group of duplicates) {
    console.log(`- "${group[0].title}" (${String(group[0].start_at).slice(0, 10)}):`);
    for (const row of group) {
      const sourceName = (row as unknown as { sources: { nombre: string } }).sources?.nombre;
      console.log(`    [${sourceName}] id=${row.id} ticket_url=${row.ticket_url ?? "-"}`);
    }
  }
}

async function run() {
  for (const connector of connectors) {
    console.log(`[${connector.name}] fetching...`);
    const raw = await connector.fetch();
    const normalized = raw.map((r) => connector.normalize(r));
    console.log(`[${connector.name}] ${normalized.length} eventos normalizados`);

    const sourceId = await ensureSourceId(connector.name, "scrape", connector.sourceUrlBase);
    const result = await upsertEvents(sourceId, normalized);
    console.log(
      `[${connector.name}] insertados=${result.inserted} actualizados=${result.updated} sin_cambios=${result.unchanged}`,
    );
  }

  await reportCrossSourceDuplicates();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
