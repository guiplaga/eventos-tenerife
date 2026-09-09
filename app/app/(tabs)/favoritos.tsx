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
import { EmptyState } from "../../components/EmptyState";
import { useTheme, spacing, radius, type Theme } from "../../lib/theme";
import type { EventRow } from "../../lib/types";

function AuthForm() {
  const theme = useTheme();
  const styles = makeStyles(theme);
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
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={theme.colors.accentContrast} />
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
  const theme = useTheme();
  const styles = makeStyles(theme);
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
        <ActivityIndicator size="large" color={theme.colors.accent} />
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
        style={{ flex: 1 }}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventListItem event={item} onPress={() => router.push(`/evento/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            message='Aún no tienes eventos guardados. Ábrelos desde el calendario y toca "Guardar".'
          />
        }
      />
    </>
  );
}

export default function FavoritosScreen() {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { session, loading } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : session ? (
        <FavoritesList />
      ) : (
        <AuthForm />
      )}
    </SafeAreaView>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
    },
    authContainer: { flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.sm + 4 },
    title: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary },
    subtitle: { color: theme.colors.textMuted, marginBottom: spacing.sm },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: radius.sm + 2,
      paddingHorizontal: spacing.sm + 6,
      paddingVertical: spacing.sm + 4,
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    primaryButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 6,
      alignItems: "center",
      marginTop: spacing.xs,
    },
    primaryButtonText: { color: theme.colors.accentContrast, fontWeight: "700", fontSize: 16 },
    link: { color: theme.colors.accent, fontWeight: "600", textAlign: "center" },
  });
}
