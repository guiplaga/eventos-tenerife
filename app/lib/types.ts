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

// Refleja la tabla `events` de Supabase (solo las columnas que usa la app).
export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  municipality: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  source_url: string;
  ticket_required: boolean;
  ticket_url: string | null;
  price_from: number | null;
  status: EventStatus;
}

// Version con el nombre de la fuente (join a `sources`), usada en el detalle.
export interface EventRowWithSource extends EventRow {
  sources: { nombre: string } | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  festival: "Festival",
  fuegos_artificiales: "Fuegos artificiales",
  teatro: "Teatro",
  concierto: "Concierto",
  fiesta_popular: "Fiesta popular",
  exposicion: "Exposición",
  familiar: "Familiar",
  deporte: "Deporte",
  gastronomia: "Gastronomía",
  otro: "Otro",
};

// Nombres de icono de Ionicons (ver @expo/vector-icons).
export const CATEGORY_ICONS: Record<Category, string> = {
  festival: "sparkles",
  fuegos_artificiales: "flash",
  teatro: "film",
  concierto: "musical-notes",
  fiesta_popular: "people",
  exposicion: "image",
  familiar: "happy",
  deporte: "football",
  gastronomia: "restaurant",
  otro: "ellipsis-horizontal",
};
