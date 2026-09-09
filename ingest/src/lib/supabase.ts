import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error("Faltan SUPABASE_URL / SUPABASE_SECRET_KEY en el entorno (.env)");
}

// Cliente del worker de ingesta: usa la secret key, ignora RLS a proposito
// (necesita poder insertar/actualizar events/venues/sources sin restriccion).
export const supabase = createClient(url, key);
