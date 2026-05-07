import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export function getApiBaseUrl(): string {
  const fromEnv = extra?.apiBaseUrl;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  return "http://127.0.0.1:8000";
}
