import Config from "react-native-config";
import { Platform } from "react-native";

export function getApiBaseUrl(): string {
  const fromEnv = (Config.API_BASE_URL ?? "").trim();
  if (fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  return "http://127.0.0.1:8000";
}
