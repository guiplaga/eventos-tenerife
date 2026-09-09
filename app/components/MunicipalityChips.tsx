import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useTheme, spacing, radius, type Theme } from "../lib/theme";

export function MunicipalityChips({
  municipalities,
  selected,
  onSelect,
}: {
  municipalities: string[];
  selected: string | null;
  onSelect: (municipality: string | null) => void;
}) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  if (municipalities.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      <Chip theme={theme} label="Toda la isla" active={selected === null} onPress={() => onSelect(null)} />
      {municipalities.map((m) => (
        <Chip
          key={m}
          theme={theme}
          label={m}
          active={selected === m}
          onPress={() => onSelect(selected === m ? null : m)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  theme,
  label,
  active,
  onPress,
}: {
  theme: Theme;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = makeStyles(theme);
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    scroll: { flexGrow: 0, flexShrink: 0 },
    row: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      gap: spacing.sm,
      alignItems: "center",
    },
    chip: {
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      alignSelf: "flex-start",
    },
    chipActive: { backgroundColor: theme.colors.accent },
    chipLabel: { fontSize: 12, color: theme.colors.accent, fontWeight: "500" },
    chipLabelActive: { color: theme.colors.accentContrast },
  });
}
