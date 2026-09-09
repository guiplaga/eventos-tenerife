import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="evento/[id]" options={{ headerShown: true, headerBackTitle: "Atrás" }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
