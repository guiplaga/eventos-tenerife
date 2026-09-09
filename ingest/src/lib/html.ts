const ENTITIES: Record<string, string> = {
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
  ordm: "º", ordf: "ª", deg: "°",
  amp: "&", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…",
};

export function decodeEntities(s: string): string {
  return s.replace(/&([a-zA-Z]+);/g, (m, name) => ENTITIES[name] ?? m);
}

export function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]+>/g, " ");
  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
}
