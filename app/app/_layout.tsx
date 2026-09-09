import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const theme = useTheme();
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="evento/[id]" options={{ headerShown: true, headerBackTitle: "Atrás" }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
