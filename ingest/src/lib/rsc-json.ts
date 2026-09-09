// Extrae objetos JSON embebidos en el payload de React Server Components
// (`self.__next_f.push([id, "..."])`) que algunas webs Next.js sirven en el
// HTML inicial. Mas fiable que parsear el HTML renderizado.
export function extractRscObjectsByKey(html: string, key: string): unknown[] {
  const pushRe = /self\.__next_f\.push\((\[.*?\])\)\s*<\/script>/gs;
  const results: unknown[] = [];
  let match: RegExpExecArray | null;

  while ((match = pushRe.exec(html))) {
    let arr: unknown;
    try {
      arr = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const chunk = Array.isArray(arr) ? arr[1] : undefined;
    if (typeof chunk !== "string" || !chunk.includes(`"${key}"`)) continue;
    for (const candidate of extractBalancedObjects(chunk, key)) {
      try {
        results.push(JSON.parse(candidate));
      } catch {
        // objeto no parseable de forma aislada (referencia cruzada entre chunks) -- se ignora
      }
    }
  }
  return results;
}

// Dado un texto y una clave objetivo, encuentra cada `{...}` que contiene esa
// clave, respetando profundidad de llaves y strings (para no cortar en un
// `{`/`}` que aparezca dentro de un valor de texto).
function extractBalancedObjects(text: string, key: string): string[] {
  const marker = `"${key}"`;
  const results: string[] = [];
  let searchFrom = 0;

  while (true) {
    const keyIdx = text.indexOf(marker, searchFrom);
    if (keyIdx === -1) break;
    const start = text.lastIndexOf("{", keyIdx);
    if (start === -1) {
      searchFrom = keyIdx + marker.length;
      continue;
    }
    let depth = 0;
    let inString = false;
    let i = start;
    for (; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (c === "\\") i++;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') inString = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    results.push(text.slice(start, i));
    searchFrom = i;
  }
  return results;
}
