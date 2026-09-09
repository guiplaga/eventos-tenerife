import type { Connector, NormalizedEvent } from "../types.js";
import { categorize } from "../lib/categorize.js";
import { nearestMunicipio } from "../lib/municipios.js";
import { stripHtml, decodeEntities } from "../lib/html.js";

// Fuente: agenda de eventos de Turismo de Tenerife. robots.txt verificado
// permisivo (solo bloquea rutas de admin de Sitecore) -- ver
// plan-app-eventos-tenerife.md seccion 2.1.
//
// Usa el endpoint JSON que la propia pagina de agenda llama internamente
// (pagecatalogueapi), en vez de parsear el HTML renderizado por JS.
const AGENDA_ITEM_ID = "d79bb313-f4f9-4adf-bf4a-2bd8e9c10398";
const BASE_URL = "https://www.webtenerife.com/pagecatalogueapi/getcontent/";

interface WebtenerifeRawItem {
  ItemId: string;
  Title: string;
  Text: string;
  Image: string;
  StartDate: string; // "/Date(1790454600000)/"
  EndDate: string;
  Url: string;
  Latitude: string;
  Longitude: string;
  IsAgendaItem: boolean;
}

interface WebtenerifeResponse {
  PageCount: number;
  PageIndex: number;
  Items: WebtenerifeRawItem[];
}

function parseDotNetDate(s: string): string | null {
  const match = /\/Date\((\d+)\)\//.exec(s);
  if (!match) return null;
  return new Date(Number(match[1])).toISOString();
}

async function fetchPage(pageIndex: number): Promise<WebtenerifeResponse> {
  const url = `${BASE_URL}?itemid=${AGENDA_ITEM_ID}&tab=1&page-index=${pageIndex}&sortfld=fechaevento&sortdir=desc&tab-view-mode=cuadricula`;
  const res = await fetch(url, {
    headers: { "User-Agent": "tenerife-eventos-ingest/0.1 (agregador de agenda cultural)" },
  });
  if (!res.ok) throw new Error(`webtenerife: HTTP ${res.status} en pagina ${pageIndex}`);
  return (await res.json()) as WebtenerifeResponse;
}

export const webtenerifeConnector: Connector<WebtenerifeRawItem> = {
  name: "webtenerife",
  sourceUrlBase: "https://www.webtenerife.com",

  async fetch() {
    const first = await fetchPage(1);
    const items = [...first.Items];
    for (let page = 2; page <= first.PageCount; page++) {
      const next = await fetchPage(page);
      items.push(...next.Items);
    }
    return items.filter((item) => item.IsAgendaItem);
  },

  normalize(raw): NormalizedEvent {
    const lat = Number(raw.Latitude);
    const lng = Number(raw.Longitude);
    const description = stripHtml(raw.Text);
    const title = decodeEntities(raw.Title);
    const startAt = parseDotNetDate(raw.StartDate);
    if (!startAt) throw new Error(`webtenerife: fecha de inicio invalida en item ${raw.ItemId}`);

    return {
      sourceId: "", // lo rellena el runner con el id real de la fila `sources`
      externalId: raw.ItemId,
      title,
      description: description || null,
      category: categorize(title, description),
      startAt,
      endAt: parseDotNetDate(raw.EndDate),
      allDay: false,
      venueName: null,
      municipality: nearestMunicipio(lat, lng),
      lat: Number.isNaN(lat) ? null : lat,
      lng: Number.isNaN(lng) ? null : lng,
      imageUrl: raw.Image || null,
      sourceUrl: raw.Url,
      ticketRequired: false,
      ticketUrl: null,
      ticketProvider: null,
      priceFrom: null,
      status: "active",
    };
  },
};
