import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Favoritos sincronizados + recordatorios: Fase 6 del plan (requiere Auth de Supabase).
export default function FavoritosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Favoritos</Text>
      <Text style={styles.subtitle}>Próximamente: inicia sesión para guardar eventos y recibir recordatorios.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#8A8A8A", textAlign: "center" },
});
