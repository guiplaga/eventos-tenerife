import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import { scheduleEventReminder, cancelEventReminder } from "./notifications";
import type { EventRow } from "./types";

// Set de event_id favoritos del usuario logueado (vacio si no hay sesion).
export function useFavoriteIds() {
  const { session } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("favorites").select("event_id");
    setFavoriteIds(new Set((data ?? []).map((row) => row.event_id as string)));
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { favoriteIds, loading, refresh };
}

export async function addFavorite(event: EventRow, userId: string) {
  const { error } = await supabase.from("favorites").insert({ event_id: event.id, user_id: userId });
  if (error) throw error;
  await scheduleEventReminder(event);
}

export async function removeFavorite(eventId: string) {
  const { error } = await supabase.from("favorites").delete().eq("event_id", eventId);
  if (error) throw error;
  await cancelEventReminder(eventId);
}
