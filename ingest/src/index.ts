import { createHash } from "node:crypto";
import type { Connector, NormalizedEvent } from "./types.js";
import { supabase } from "./lib/supabase.js";
import { webtenerifeConnector } from "./connectors/webtenerife.js";

const connectors: Connector[] = [webtenerifeConnector];

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

async function run() {
  for (const connector of connectors) {
    console.log(`[${connector.name}] fetching...`);
    const raw = await connector.fetch();
    const normalized = raw.map((r) => connector.normalize(r));
    console.log(`[${connector.name}] ${normalized.length} eventos normalizados`);

    const sourceId = await ensureSourceId(connector.name, "scrape", "https://www.webtenerife.com");
    const result = await upsertEvents(sourceId, normalized);
    console.log(
      `[${connector.name}] insertados=${result.inserted} actualizados=${result.updated} sin_cambios=${result.unchanged}`,
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
