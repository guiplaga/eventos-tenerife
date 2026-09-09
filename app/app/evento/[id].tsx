import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { addFavorite, removeFavorite } from "../../lib/favorites";
import { CATEGORY_LABELS } from "../../lib/types";
import type { EventRowWithSource } from "../../lib/types";

function formatWhen(startAt: string, endAt: string | null, allDay: boolean): string {
  const start = new Date(startAt);
  const startStr = start.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = allDay
    ? ""
    : ` · ${start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  if (!endAt) return `${startStr}${timeStr}`;
  const end = new Date(endAt);
  if (end.toDateString() === start.toDateString()) return `${startStr}${timeStr}`;
  const endStr = end.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return `${startStr} — ${endStr}`;
}

export default function EventoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [event, setEvent] = useState<EventRowWithSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("events")
      .select(
        "id, title, description, category, start_at, end_at, all_day, municipality, lat, lng, image_url, source_url, ticket_required, ticket_url, price_from, status, sources(nombre)",
      )
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message);
        else setEvent(data as unknown as EventRowWithSource);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id || !session) {
      setIsFavorite(false);
      return;
    }
    supabase
      .from("favorites")
      .select("event_id")
      .eq("event_id", id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(Boolean(data)));
  }, [id, session]);

  async function toggleFavorite() {
    if (!event) return;
    if (!session) {
      Alert.alert("Inicia sesión", "Para guardar eventos primero inicia sesión en la pestaña Favoritos.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Ir a Favoritos", onPress: () => router.push("/favoritos") },
      ]);
      return;
    }
    setSavingFavorite(true);
    try {
      if (isFavorite) {
        await removeFavorite(event.id);
        setIsFavorite(false);
      } else {
        await addFavorite(event, session.user.id);
        setIsFavorite(true);
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSavingFavorite(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0071CE" />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No se pudo cargar el evento.</Text>
      </SafeAreaView>
    );
  }

  const mapsUrl =
    event.lat != null && event.lng != null
      ? `https://www.google.com/maps?q=${event.lat},${event.lng}`
      : null;

  return (
    <>
      <Stack.Screen options={{ title: "", headerTransparent: true, headerTintColor: "#fff" }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={48} color="#B0B0B0" />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.category}>{CATEGORY_LABELS[event.category]}</Text>
          <Text style={styles.title}>{event.title}</Text>

          {(event.status === "cancelled" || event.status === "postponed") && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {event.status === "cancelled" ? "Evento cancelado" : "Evento aplazado"}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color="#6B6B6B" />
            <Text style={styles.rowText}>{formatWhen(event.start_at, event.end_at, event.all_day)}</Text>
          </View>

          {event.municipality && (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color="#6B6B6B" />
              <Text style={styles.rowText}>{event.municipality}</Text>
              {mapsUrl && (
                <Pressable onPress={() => Linking.openURL(mapsUrl)}>
                  <Text style={styles.link}>Ver en el mapa</Text>
                </Pressable>
              )}
            </View>
          )}

          {event.description && <Text style={styles.description}>{event.description}</Text>}

          {event.source_url && (
            <Pressable onPress={() => Linking.openURL(event.source_url)}>
              <Text style={styles.sourceLink}>
                Fuente: {event.sources?.nombre ?? "ver original"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, styles.footerRow]}>
        {event.ticket_required && event.ticket_url && (
          <Pressable
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={() => Linking.openURL(event.ticket_url!)}
          >
            <Text style={styles.primaryButtonText}>
              Comprar entrada{event.price_from != null ? ` · desde ${event.price_from} €` : ""}
            </Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.secondaryButton,
            !(event.ticket_required && event.ticket_url) && { flex: 1 },
          ]}
          onPress={toggleFavorite}
          disabled={savingFavorite}
        >
          {savingFavorite ? (
            <ActivityIndicator color="#0071CE" />
          ) : (
            <>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color="#0071CE" />
              <Text style={styles.secondaryButtonText}>{isFavorite ? "Guardado" : "Guardar"}</Text>
            </>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: 260, backgroundColor: "#E8E8E8" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: 20, gap: 10 },
  category: { color: "#0071CE", fontWeight: "700", fontSize: 13, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "700" },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FDECEC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusBadgeText: { color: "#C0392B", fontWeight: "600", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  rowText: { fontSize: 15, color: "#3C3C3C" },
  link: { color: "#0071CE", fontWeight: "600", fontSize: 14 },
  description: { fontSize: 15, lineHeight: 22, color: "#3C3C3C", marginTop: 8 },
  sourceLink: { color: "#0071CE", marginTop: 8, fontSize: 13 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E2E2",
    backgroundColor: "#FFFFFF",
  },
  footerRow: { flexDirection: "row", gap: 10 },
  primaryButton: {
    backgroundColor: "#0071CE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#0071CE",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#0071CE", fontWeight: "700", fontSize: 16 },
});
