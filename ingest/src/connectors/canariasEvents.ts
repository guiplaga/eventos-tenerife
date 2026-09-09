import type { Connector, NormalizedEvent } from "../types.js";
import { categorize } from "../lib/categorize.js";
import { extractRscObjectsByKey } from "../lib/rsc-json.js";

// Fuente: agregador canarias.events. robots.txt verificado permisivo
// (Allow: / total, con sitemap) -- ver plan-app-eventos-tenerife.md seccion 2.1.
//
// La pagina es Next.js y sirve los eventos ya estructurados dentro del HTML
// inicial como payload de React Server Components (self.__next_f.push), con
// municipio y ticketUrl ya resueltos por el propio agregador -- no hace falta
// parsear el HTML renderizado ni tocar Tomaticket directamente aunque el
// ticketUrl final apunte ahi.
const LISTING_URL = "https://canarias.events/es/tenerife/";

interface CanariasEventsRawItem {
  slug: string;
  title: string;
  description: string;
  island: string;
  startDate: string; // "$D2026-09-11T00:00:00.000Z"
  endDate: string;
  location?: { venue?: string; municipality?: string };
  isFree?: boolean;
  imageUrl?: string;
  price?: string;
  ticketUrl?: string;
  detailsUrl?: string;
}

function stripDMarker(s: string | undefined): string | null {
  if (!s || s === "$undefined") return null;
  return s.startsWith("$D") ? s.slice(2) : s;
}

function orNull(s: string | undefined): string | null {
  return !s || s === "$undefined" ? null : s;
}

function parsePriceFrom(price: string | undefined, isFree: boolean | undefined): number | null {
  if (isFree) return 0;
  if (!price || price === "$undefined") return null;
  const match = /(\d+(?:[.,]\d+)?)/.exec(price);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

function inferTicketProvider(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("tomaticket.es")) return "tomaticket";
  if (url.includes("tickety.es")) return "tickety";
  return "otro";
}

export const canariasEventsConnector: Connector<CanariasEventsRawItem> = {
  name: "canarias_events",
  sourceUrlBase: "https://canarias.events",

  async fetch() {
    const res = await fetch(LISTING_URL, {
      headers: { "User-Agent": "tenerife-eventos-ingest/0.1 (agregador de agenda cultural)" },
    });
    if (!res.ok) throw new Error(`canarias.events: HTTP ${res.status}`);
    const html = await res.text();

    const raw = extractRscObjectsByKey(html, "slug") as CanariasEventsRawItem[];
    const seen = new Set<string>();
    return raw.filter((item) => {
      if (item.island !== "tenerife" || !item.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  },

  normalize(raw): NormalizedEvent {
    const title = raw.title;
    const description = orNull(raw.description);
    const startAt = stripDMarker(raw.startDate);
    if (!startAt) throw new Error(`canarias_events: fecha de inicio invalida en item ${raw.slug}`);
    const ticketUrl = orNull(raw.ticketUrl);

    return {
      sourceId: "",
      externalId: raw.slug,
      title,
      description,
      category: categorize(title, description ?? ""),
      startAt,
      endAt: stripDMarker(raw.endDate),
      allDay: true, // la fuente solo da fecha, sin hora
      venueName: orNull(raw.location?.venue),
      municipality: orNull(raw.location?.municipality),
      imageUrl: orNull(raw.imageUrl),
      sourceUrl: orNull(raw.detailsUrl) ?? `https://canarias.events/es/tenerife/event/${raw.slug}/`,
      ticketRequired: Boolean(ticketUrl) && !raw.isFree,
      ticketUrl,
      ticketProvider: inferTicketProvider(ticketUrl),
      priceFrom: parsePriceFrom(raw.price, raw.isFree),
      status: "active",
    };
  },
};
