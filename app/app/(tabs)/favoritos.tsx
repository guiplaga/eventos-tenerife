import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { EventListItem } from "../../components/EventListItem";
import type { EventRow } from "../../lib/types";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setSubmitting(true);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) Alert.alert("Error", error.message);
    else if (mode === "signup") Alert.alert("Revisa tu email", "Confirma tu cuenta para poder entrar.");
  }

  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Favoritos</Text>
      <Text style={styles.subtitle}>
        Inicia sesión para guardar eventos y recibir un recordatorio la víspera.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </Text>
        )}
      </Pressable>
      <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")}>
        <Text style={styles.link}>
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
        </Text>
      </Pressable>
    </View>
  );
}

function FavoritesList() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("favorites")
      .select(
        "events(id, title, description, category, start_at, end_at, all_day, municipality, lat, lng, image_url, source_url, ticket_required, ticket_url, price_from, status)",
      );
    const rows = ((data ?? []) as unknown as { events: EventRow }[])
      .map((row) => row.events)
      .filter(Boolean)
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
    setEvents(rows);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0071CE" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.link}>Cerrar sesión</Text>
        </Pressable>
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aún no tienes eventos guardados. Ábrelos desde el calendario y toca "Guardar".
          </Text>
        }
      />
    </>
  );
}

export default function FavoritosScreen() {
  const { session, loading } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0071CE" />
        </View>
      ) : session ? (
        <FavoritesList />
      ) : (
        <AuthForm />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authContainer: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#8A8A8A", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#0071CE",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  link: { color: "#0071CE", fontWeight: "600", textAlign: "center" },
  emptyText: { textAlign: "center", color: "#8A8A8A", marginTop: 24, paddingHorizontal: 24 },
});
