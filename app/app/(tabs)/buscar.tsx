import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Busqueda por texto + filtros por municipio: Fase 6 del plan.
export default function BuscarScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buscar</Text>
      <Text style={styles.subtitle}>Próximamente: búsqueda por texto y filtro por municipio.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#8A8A8A", textAlign: "center" },
});
