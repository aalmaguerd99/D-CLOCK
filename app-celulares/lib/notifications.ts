import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getServerUrl } from "./storage";

const PUSH_STATUS_KEY = "push_registered";

export async function getPushStatus(): Promise<boolean> {
  const val = await AsyncStorage.getItem(PUSH_STATUS_KEY);
  return val === "true";
}

export async function registerPushToken(
  employeeId: number
): Promise<{ ok: boolean; error?: string }> {
  if (Constants.appOwnership === "expo") {
    return { ok: false, error: "Expo Go no soporta notificaciones push" };
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    await AsyncStorage.setItem(PUSH_STATUS_KEY, "false");
    return { ok: false, error: "Permiso de notificaciones no otorgado. Actívalo en Ajustes del teléfono." };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenResult = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  const serverUrl = await getServerUrl();
  if (!serverUrl) {
    return { ok: false, error: "URL de servidor no configurada" };
  }

  const res = await fetch(`${serverUrl}/api/mobile/push-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employee_id: employeeId,
      token: tokenResult.data,
      platform: Platform.OS,
    }),
  });

  if (!res.ok) {
    await AsyncStorage.setItem(PUSH_STATUS_KEY, "false");
    return { ok: false, error: `Error del servidor (${res.status}). Verifica conexión al servidor.` };
  }

  await AsyncStorage.setItem(PUSH_STATUS_KEY, "true");
  return { ok: true };
}
