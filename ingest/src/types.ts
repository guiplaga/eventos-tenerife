export type Category =
  | "festival"
  | "fuegos_artificiales"
  | "teatro"
  | "concierto"
  | "fiesta_popular"
  | "exposicion"
  | "familiar"
  | "deporte"
  | "gastronomia"
  | "otro";

export type EventStatus = "active" | "cancelled" | "postponed";

// Evento ya normalizado al modelo comun, listo para upsert en Supabase.
export interface NormalizedEvent {
  sourceId: string;
  externalId: string;
  title: string;
  description: string | null;
  category: Category;
  startAt: string; // ISO timestamptz
  endAt: string | null;
  allDay: boolean;
  venueName: string | null;
  municipality: string | null;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  sourceUrl: string;
  ticketRequired: boolean;
  ticketUrl: string | null;
  ticketProvider: string | null;
  priceFrom: number | null;
  status: EventStatus;
}

// Cada fuente implementa esta interfaz. fetch() es especifico de la fuente;
// normalize() traduce su formato crudo al modelo comun.
export interface Connector<TRaw = unknown> {
  name: string;
  sourceUrlBase: string;
  fetch(): Promise<TRaw[]>;
  normalize(raw: TRaw): NormalizedEvent;
}
