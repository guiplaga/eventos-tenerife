// Centroides aproximados de los 31 municipios de Tenerife. Heuristica simple de
// "municipio mas cercano por distancia" para cuando la fuente solo da lat/lng
// (ver plan-app-eventos-tenerife.md seccion 5, paso 3 "Geocodificar").
// Precision limitada cerca de fronteras municipales -- suficiente para v1.
const MUNICIPIOS: { nombre: string; lat: number; lng: number }[] = [
  { nombre: "Adeje", lat: 28.1224, lng: -16.7261 },
  { nombre: "Arafo", lat: 28.3283, lng: -16.4442 },
  { nombre: "Arico", lat: 28.1948, lng: -16.4903 },
  { nombre: "Arona", lat: 28.0994, lng: -16.681 },
  { nombre: "Buenavista del Norte", lat: 28.3717, lng: -16.8494 },
  { nombre: "Candelaria", lat: 28.3567, lng: -16.3672 },
  { nombre: "Fasnia", lat: 28.2333, lng: -16.4333 },
  { nombre: "Garachico", lat: 28.3706, lng: -16.7642 },
  { nombre: "Granadilla de Abona", lat: 28.1167, lng: -16.5833 },
  { nombre: "Guía de Isora", lat: 28.2167, lng: -16.7833 },
  { nombre: "Güímar", lat: 28.3117, lng: -16.4114 },
  { nombre: "Icod de los Vinos", lat: 28.3667, lng: -16.7167 },
  { nombre: "La Guancha", lat: 28.3667, lng: -16.6167 },
  { nombre: "La Laguna", lat: 28.4874, lng: -16.3159 },
  { nombre: "La Matanza de Acentejo", lat: 28.3833, lng: -16.4333 },
  { nombre: "La Orotava", lat: 28.3906, lng: -16.5225 },
  { nombre: "La Victoria de Acentejo", lat: 28.3833, lng: -16.4667 },
  { nombre: "Los Realejos", lat: 28.3833, lng: -16.5833 },
  { nombre: "Los Silos", lat: 28.3663, lng: -16.8179 },
  { nombre: "El Rosario", lat: 28.4667, lng: -16.3167 },
  { nombre: "El Sauzal", lat: 28.3833, lng: -16.4333 },
  { nombre: "San Juan de la Rambla", lat: 28.3833, lng: -16.6333 },
  { nombre: "San Miguel de Abona", lat: 28.1, lng: -16.6333 },
  { nombre: "Santa Cruz de Tenerife", lat: 28.4636, lng: -16.2518 },
  { nombre: "Santa Úrsula", lat: 28.4167, lng: -16.4833 },
  { nombre: "Santiago del Teide", lat: 28.2833, lng: -16.8167 },
  { nombre: "El Tanque", lat: 28.3667, lng: -16.7333 },
  { nombre: "Tacoronte", lat: 28.4747, lng: -16.4128 },
  { nombre: "Tegueste", lat: 28.5167, lng: -16.3167 },
  { nombre: "Vilaflor de Chasna", lat: 28.1522, lng: -16.6392 },
  { nombre: "Puerto de la Cruz", lat: 28.413, lng: -16.547 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestMunicipio(lat: number, lng: number): string | null {
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  let best: { nombre: string; dist: number } | null = null;
  for (const m of MUNICIPIOS) {
    const dist = haversineKm(lat, lng, m.lat, m.lng);
    if (!best || dist < best.dist) best = { nombre: m.nombre, dist };
  }
  return best?.nombre ?? null;
}
