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

type ViewMode = "calendario" | "lista";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarioScreen() {
  const router = useRouter();
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
      marks[day] = { marked: true, dotColor: "#0071CE" };
    }
    return {
      ...marks,
      [selectedDate]: { ...(marks[selectedDate] ?? { marked: false, dotColor: "#0071CE" }), selected: true },
    };
  }, [filteredEvents, selectedDate]);

  const dayEvents = useMemo(
    () => filteredEvents.filter((e) => e.start_at.slice(0, 10) === selectedDate),
    [filteredEvents, selectedDate],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0071CE" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>No se pudieron cargar los eventos.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
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
          <Ionicons name={viewMode === "calendario" ? "list" : "calendar"} size={18} color="#0071CE" />
          <Text style={styles.toggleLabel}>{viewMode === "calendario" ? "Lista" : "Calendario"}</Text>
        </Pressable>
      </View>

      <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />

      {viewMode === "calendario" ? (
        <>
          <Calendar
            current={selectedDate}
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            theme={{ todayTextColor: "#0071CE", selectedDayBackgroundColor: "#0071CE", dotColor: "#0071CE" }}
          />
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay eventos este día.</Text>
            }
          />
        </>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos próximamente.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  toggleButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  toggleLabel: { color: "#0071CE", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#8A8A8A", marginTop: 24 },
  errorText: { fontWeight: "600" },
  errorDetail: { color: "#8A8A8A", fontSize: 13, textAlign: "center" },
});
