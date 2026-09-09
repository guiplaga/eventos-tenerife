import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="evento/[id]" options={{ headerShown: true, headerBackTitle: "Atrás" }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
