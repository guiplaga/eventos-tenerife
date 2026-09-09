import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, spacing, type Theme } from "../lib/theme";

export function EmptyState({ icon, message }: { icon: keyof typeof Ionicons.glyphMap; message: string }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={32} color={theme.colors.textMuted} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", gap: spacing.sm, marginTop: spacing.xl },
    message: { textAlign: "center", color: theme.colors.textMuted, paddingHorizontal: spacing.lg },
  });
}
