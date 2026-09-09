import { ScrollView, Pressable, Text, StyleSheet } from "react-native";

export function MunicipalityChips({
  municipalities,
  selected,
  onSelect,
}: {
  municipalities: string[];
  selected: string | null;
  onSelect: (municipality: string | null) => void;
}) {
  if (municipalities.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label="Toda la isla" active={selected === null} onPress={() => onSelect(null)} />
      {municipalities.map((m) => (
        <Chip key={m} label={m} active={selected === m} onPress={() => onSelect(selected === m ? null : m)} />
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
  row: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#0071CE",
  },
  chipActive: { backgroundColor: "#0071CE" },
  chipLabel: { fontSize: 12, color: "#0071CE", fontWeight: "500" },
  chipLabelActive: { color: "#FFFFFF" },
});
