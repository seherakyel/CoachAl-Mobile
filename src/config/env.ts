import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

function stripTrailingApi(url: string): string {
  let u = url.replace(/\/$/, "");
  if (u.toLowerCase().endsWith("/api")) u = u.slice(0, -4).replace(/\/$/, "");
  return u;
}

function normalizeForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
  return url.replace(/localhost/gi, "127.0.0.1");
}

export function getApiBaseUrl(): string {
  const manual = stripTrailingApi((Config.API_BASE_URL ?? "").trim());
  if (manual.length > 0) return normalizeForAndroid(manual);
  if (__DEV__) return devApiBase();
  const prod = stripTrailingApi((Config.API_BASE_URL_PRODUCTION ?? "").trim());
  if (prod.length > 0) return normalizeForAndroid(prod);
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
