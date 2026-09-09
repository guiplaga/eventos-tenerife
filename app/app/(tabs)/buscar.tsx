import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import type { Category, EventRow } from "../../lib/types";
import { CategoryChips } from "../../components/CategoryChips";
import { MunicipalityChips } from "../../components/MunicipalityChips";
import { EventListItem } from "../../components/EventListItem";
import { EmptyState } from "../../components/EmptyState";
import { useTheme, spacing, radius, type Theme } from "../../lib/theme";

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function BuscarScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [municipality, setMunicipality] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select(
        "id, title, description, category, start_at, end_at, all_day, municipality, lat, lng, image_url, source_url, ticket_required, ticket_url, price_from, status",
      )
      .order("start_at", { ascending: true })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  const municipalities = useMemo(
    () => [...new Set(events.map((e) => e.municipality).filter((m): m is string => Boolean(m)))].sort(),
    [events],
  );

  const results = useMemo(() => {
    const normalizedQuery = stripAccents(query.trim().toLowerCase());
    return events.filter((event) => {
      if (category && event.category !== category) return false;
      if (municipality && event.municipality !== municipality) return false;
      if (!normalizedQuery) return true;
      const haystack = stripAccents(`${event.title} ${event.description ?? ""}`.toLowerCase());
      return haystack.includes(normalizedQuery);
    });
  }, [events, query, category, municipality]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <CategoryChips selected={category} onSelect={setCategory} />
      <MunicipalityChips
        municipalities={municipalities}
        selected={municipality}
        onSelect={setMunicipality}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState icon="search-outline" message="No hay eventos que coincidan." />}
        style={{ marginTop: spacing.xs }}
      />
    </SafeAreaView>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm + 4,
      marginBottom: spacing.sm + 4,
      paddingHorizontal: spacing.sm + 6,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.sm + 2,
      backgroundColor: theme.colors.surface,
    },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.textPrimary },
  });
}
