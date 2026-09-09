import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, type DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import type { Category, EventRow } from "../../lib/types";
import { CategoryChips } from "../../components/CategoryChips";
import { EventListItem } from "../../components/EventListItem";
import { EmptyState } from "../../components/EmptyState";
import { useTheme, spacing, type Theme } from "../../lib/theme";

type ViewMode = "calendario" | "lista";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarioScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendario");

  useEffect(() => {
    supabase
      .from("events")
      .select(
        "id, title, description, category, start_at, end_at, all_day, municipality, lat, lng, image_url, source_url, ticket_required, ticket_url, price_from, status",
      )
      .order("start_at", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message);
        else setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredEvents = useMemo(
    () => (selectedCategory ? events.filter((e) => e.category === selectedCategory) : events),
    [events, selectedCategory],
  );

  // Nota: agrupa por la fecha en UTC de start_at, no en hora local de Canarias.
  // Simplificacion aceptada para v1 -- solo desajusta eventos de madrugada.
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: true; dotColor: string }> = {};
    for (const event of filteredEvents) {
      const day = event.start_at.slice(0, 10);
      marks[day] = { marked: true, dotColor: theme.colors.accent };
    }
    return {
      ...marks,
      [selectedDate]: {
        ...(marks[selectedDate] ?? { marked: false, dotColor: theme.colors.accent }),
        selected: true,
      },
    };
  }, [filteredEvents, selectedDate, theme.colors.accent]);

  const dayEvents = useMemo(
    () => filteredEvents.filter((e) => e.start_at.slice(0, 10) === selectedDate),
    [filteredEvents, selectedDate],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={32} color={theme.colors.textMuted} />
        <Text style={styles.errorText}>No se pudieron cargar los eventos.</Text>
        <Text style={styles.errorDetail}>Revisa tu conexión e inténtalo de nuevo.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda de Tenerife</Text>
        <Pressable
          style={styles.toggleButton}
          onPress={() => setViewMode(viewMode === "calendario" ? "lista" : "calendario")}
        >
          <Ionicons
            name={viewMode === "calendario" ? "list" : "calendar"}
            size={18}
            color={theme.colors.accent}
          />
          <Text style={styles.toggleLabel}>{viewMode === "calendario" ? "Lista" : "Calendario"}</Text>
        </Pressable>
      </View>

      <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />

      {viewMode === "calendario" ? (
        <>
          <Calendar
            key={theme.dark ? "dark" : "light"}
            current={selectedDate}
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            theme={{
              calendarBackground: theme.colors.background,
              dayTextColor: theme.colors.textPrimary,
              monthTextColor: theme.colors.textPrimary,
              textSectionTitleColor: theme.colors.textMuted,
              textDisabledColor: theme.colors.border,
              arrowColor: theme.colors.accent,
              todayTextColor: theme.colors.accent,
              selectedDayBackgroundColor: theme.colors.accent,
              selectedDayTextColor: theme.colors.accentContrast,
              dotColor: theme.colors.accent,
            }}
          />
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
            )}
            ListEmptyComponent={<EmptyState icon="calendar-clear-outline" message="No hay eventos este día." />}
          />
        </>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
          )}
          ListEmptyComponent={<EmptyState icon="calendar-clear-outline" message="No hay eventos próximamente." />}
        />
      )}
    </SafeAreaView>
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
      padding: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
    },
    headerTitle: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary },
    toggleButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    toggleLabel: { color: theme.colors.accent, fontWeight: "600" },
    errorText: { fontWeight: "600", color: theme.colors.textPrimary },
    errorDetail: { color: theme.colors.textMuted, fontSize: 13, textAlign: "center" },
  });
}
