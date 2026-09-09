import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import type { Category } from "../lib/types";
import { CATEGORY_LABELS } from "../lib/types";
import { useTheme, spacing, radius, type Theme } from "../lib/theme";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function CategoryChips({
  selected,
  onSelect,
}: {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      <Chip theme={theme} label="Todas" active={selected === null} onPress={() => onSelect(null)} />
      {ALL_CATEGORIES.map((category) => (
        <Chip
          key={category}
          theme={theme}
          label={CATEGORY_LABELS[category]}
          active={selected === category}
          onPress={() => onSelect(selected === category ? null : category)}
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
    row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.sm, alignItems: "center" },
    chip: {
      paddingHorizontal: spacing.sm + 6,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      alignSelf: "flex-start",
    },
    chipActive: { backgroundColor: theme.colors.accent },
    chipLabel: { fontSize: 13, color: theme.colors.textPrimary, fontWeight: "500" },
    chipLabelActive: { color: theme.colors.accentContrast },
  });
}
