import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

/** .env / .env.local içinde API_BASE_URL yoksa (__DEV__) Android emülatörde host makine = 10.0.2.2. */
function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

/** axios zaten `/api` ekler; env'de sonda `/api` yazılırsa çift `/api/api` olur. */
function stripDuplicateApiPath(url: string): string {
  let u = url.replace(/\/$/, "");
  if (u.toLowerCase().endsWith("/api")) {
    u = u.slice(0, -4).replace(/\/$/, "");
  }
  return u;
}

/** Android: localhost → 127.0.0.1 (10.0.2.2 dokunulmaz). */
function normalizeApiBaseForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
  return url.replace(/localhost/gi, "127.0.0.1");
}

export function getApiBaseUrl(): string {
  const manual = stripDuplicateApiPath((Config.API_BASE_URL ?? "").trim());
  if (manual.length > 0) return normalizeApiBaseForAndroid(manual);
  if (__DEV__) return devApiBase();
  const prod = stripDuplicateApiPath((Config.API_BASE_URL_PRODUCTION ?? "").trim());
  if (prod.length > 0) return normalizeApiBaseForAndroid(prod);
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
