import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventRow } from "../lib/types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../lib/types";
import { useTheme, spacing, radius, type Theme } from "../lib/theme";

function formatDate(iso: string, allDay: boolean): string {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  if (allDay) return dateStr;
  const timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} · ${timeStr}`;
}

export function EventListItem({ event, onPress }: { event: EventRow; onPress?: () => void }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const accent = theme.categoryAccents[event.category];
  const statusLabel =
    event.status === "postponed" ? "Aplazado" : event.status === "cancelled" ? "Cancelado" : null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: accent + "22" }]}>
        <Ionicons name={CATEGORY_ICONS[event.category] as never} size={18} color={accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.meta}>{formatDate(event.start_at, event.all_day)}</Text>
        <Text style={styles.meta}>
          {CATEGORY_LABELS[event.category]}
          {event.municipality ? ` · ${event.municipality}` : ""}
          {statusLabel && <Text style={{ color: theme.colors.danger }}> · {statusLabel}</Text>}
        </Text>
      </View>
      {event.ticket_required && <Ionicons name="ticket-outline" size={20} color={theme.colors.accent} />}
    </Pressable>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.md,
      gap: spacing.sm + 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    content: { flex: 1, gap: 2 },
    title: { fontSize: 16, fontWeight: "600", color: theme.colors.textPrimary },
    meta: { fontSize: 13, color: theme.colors.textSecondary },
  });
}
