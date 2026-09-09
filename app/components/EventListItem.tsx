import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventRow } from "../lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../lib/types";

function formatDate(iso: string, allDay: boolean): string {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  if (allDay) return dateStr;
  const timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${timeStr}`;
}

export function EventListItem({ event, onPress }: { event: EventRow; onPress?: () => void }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name={CATEGORY_ICONS[event.category] as never} size={18} color="#0071CE" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.meta}>{formatDate(event.start_at, event.all_day)}</Text>
        <Text style={styles.meta}>
          {CATEGORY_LABELS[event.category]}
          {event.municipality ? ` · ${event.municipality}` : ""}
          {event.status === "postponed" ? " · Aplazado" : ""}
          {event.status === "cancelled" ? " · Cancelado" : ""}
        </Text>
      </View>
      {event.ticket_required && <Ionicons name="ticket-outline" size={20} color="#0071CE" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E2E2",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#6B6B6B" },
});
