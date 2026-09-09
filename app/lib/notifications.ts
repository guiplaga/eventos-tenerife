import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { EventRow } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Identificador determinista por evento -- permite cancelar sin tener que
// guardar el id de notificacion en ningun sitio.
function notificationIdFor(eventId: string): string {
  return `event-reminder-${eventId}`;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false; // sin soporte de notificaciones locales en web
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Recordatorio la vispera a las 10:00 (hora local del dispositivo). Si el
// evento es en menos de un dia, no programa nada -- no tiene sentido avisar
// "manana" de algo que ya paso el momento util para prepararse.
export async function scheduleEventReminder(event: EventRow): Promise<void> {
  if (Platform.OS === "web") return;
  const start = new Date(event.start_at);
  const reminderAt = new Date(start);
  reminderAt.setDate(reminderAt.getDate() - 1);
  reminderAt.setHours(10, 0, 0, 0);

  if (reminderAt.getTime() <= Date.now()) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdFor(event.id),
    content: {
      title: "Mañana: " + event.title,
      body: event.municipality ? `En ${event.municipality}` : "No te lo pierdas",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt },
  });
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(notificationIdFor(eventId));
}
