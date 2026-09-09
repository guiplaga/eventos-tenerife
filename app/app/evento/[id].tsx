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
import { useTheme, spacing, radius, type Theme } from "../../lib/theme";

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
  const theme = useTheme();
  const styles = makeStyles(theme);
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
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={32} color={theme.colors.textMuted} />
        <Text style={styles.errorText}>No se pudo cargar el evento.</Text>
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
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={48} color={theme.colors.textMuted} />
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
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.rowText}>{formatWhen(event.start_at, event.end_at, event.all_day)}</Text>
          </View>

          {event.municipality && (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
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
            <ActivityIndicator color={theme.colors.accent} />
          ) : (
            <>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color={theme.colors.accent} />
              <Text style={styles.secondaryButtonText}>{isFavorite ? "Guardado" : "Guardar"}</Text>
            </>
          )}
        </Pressable>
      </View>
    </>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: theme.colors.background,
    },
    errorText: { color: theme.colors.textPrimary },
    image: { width: "100%", height: 260, backgroundColor: theme.colors.surface },
    imagePlaceholder: { alignItems: "center", justifyContent: "center" },
    body: { padding: spacing.md + 4, gap: spacing.sm + 2 },
    category: { color: theme.colors.accent, fontWeight: "700", fontSize: 13, textTransform: "uppercase" },
    title: { fontSize: 26, fontWeight: "700", color: theme.colors.textPrimary },
    statusBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.dangerSurface,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },
    statusBadgeText: { color: theme.colors.danger, fontWeight: "600", fontSize: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
    rowText: { fontSize: 15, color: theme.colors.textPrimary },
    link: { color: theme.colors.accent, fontWeight: "600", fontSize: 14 },
    description: { fontSize: 15, lineHeight: 22, color: theme.colors.textPrimary, marginTop: spacing.xs },
    sourceLink: { color: theme.colors.accent, marginTop: spacing.xs, fontSize: 13 },
    footer: {
      padding: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    footerRow: { flexDirection: "row", gap: spacing.sm + 2 },
    primaryButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 6,
      alignItems: "center",
    },
    primaryButtonText: { color: theme.colors.accentContrast, fontWeight: "700", fontSize: 16 },
    secondaryButton: {
      flexDirection: "row",
      gap: spacing.xs + 2,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 6,
      paddingHorizontal: spacing.md + 2,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: { color: theme.colors.accent, fontWeight: "700", fontSize: 16 },
  });
}
