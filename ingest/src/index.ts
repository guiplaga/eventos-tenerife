import type { Connector } from "./types.js";

// Fase 2 anade aqui el primer conector real (datos.canarias.es).
const connectors: Connector[] = [];

async function run() {
  for (const connector of connectors) {
    console.log(`[${connector.name}] fetching...`);
    const raw = await connector.fetch();
    const normalized = raw.map((r) => connector.normalize(r));
    console.log(`[${connector.name}] ${normalized.length} eventos normalizados`);
    // Fase 2 anade aqui: dedup + upsert en Supabase.
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
