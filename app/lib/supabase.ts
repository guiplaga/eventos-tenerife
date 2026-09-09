import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env");
}

// Cliente de la app: usa la publishable key, respeta RLS (solo ve
// events.reviewed = true; favorites solo las propias del usuario logueado).
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // En web, expo-router ya gestiona la URL; evita que supabase-js intente
    // parsear tokens de la barra de direcciones.
    detectSessionInUrl: Platform.OS === "web" ? false : undefined,
  },
});
