import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

export function getApiBaseUrl(): string {
  const manual = (Config.API_BASE_URL ?? "").trim();
  if (manual.length > 0) return manual.replace(/\/$/, "");
  if (__DEV__) return devApiBase();
  const prod = (Config.API_BASE_URL_PRODUCTION ?? "").trim();
  if (prod.length > 0) return prod.replace(/\/$/, "");
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
