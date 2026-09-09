import type { Category } from "../types.js";

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Reglas por palabras clave, en orden de especificidad (la primera que matchea gana).
// Ver plan-app-eventos-tenerife.md seccion 5, paso 4.
const RULES: [Category, RegExp][] = [
  ["fuegos_artificiales", /fuegos artificiales|pirotecni/],
  ["gastronomia", /gastronom|feria del vino|guachinche|ropa vieja/],
  ["deporte", /maraton|carrera popular|\bliga\b|torneo|ciclismo|triatlon/],
  ["exposicion", /exposicion|muestra de arte|galeria/],
  ["teatro", /\bteatro\b|\bopera\b|\bdanza\b|\bballet\b/],
  ["familiar", /infantil|familiar|para toda la familia/],
  ["fiesta_popular", /romeria|fiestas patronales|fiesta patronal|verbena|baile de magos/],
  ["festival", /festival/],
  ["concierto", /concierto|sinfonica|orquesta/],
];

export function categorize(title: string, text: string): Category {
  const haystack = stripAccents(`${title} ${text}`.toLowerCase());
  for (const [category, pattern] of RULES) {
    if (pattern.test(haystack)) return category;
  }
  return "otro";
}
