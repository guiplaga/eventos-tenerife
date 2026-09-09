import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import type { Category } from "../lib/types";
import { CATEGORY_LABELS } from "../lib/types";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function CategoryChips({
  selected,
  onSelect,
}: {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label="Todas" active={selected === null} onPress={() => onSelect(null)} />
      {ALL_CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={CATEGORY_LABELS[category]}
          active={selected === category}
          onPress={() => onSelect(selected === category ? null : category)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "#F0F0F0",
  },
  chipActive: { backgroundColor: "#0071CE" },
  chipLabel: { fontSize: 13, color: "#3C3C3C", fontWeight: "500" },
  chipLabelActive: { color: "#FFFFFF" },
});
