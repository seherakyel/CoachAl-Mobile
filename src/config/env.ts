import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

/** Geliştirme: iOS Simülatör ve Android emülatör (adb reverse ile) için host makine. Gerçek telefonda API_BASE_URL ile LAN IP verin. */
function devApiBase(): string {
  return "http://127.0.0.1:8000";
}

/** axios zaten `/api` ekler; `.env`'de sonda `/api` yazılırsa çift `/api/api` olur. */
function stripDuplicateApiPath(url: string): string {
  let u = url.replace(/\/$/, "");
  if (u.toLowerCase().endsWith("/api")) {
    u = u.slice(0, -4).replace(/\/$/, "");
  }
  return u;
}

/** Android: yaygın IP yazım hatası; localhost → 127.0.0.1 (adb reverse ile uyumlu). */
function normalizeApiBaseForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
  let u = url.replace(/10\.0\.0\.2/gi, "10.0.2.2");
  return u.replace(/localhost/gi, "127.0.0.1");
}

export function getApiBaseUrl(): string {
  const manual = stripDuplicateApiPath((Config.API_BASE_URL ?? "").trim());
  if (manual.length > 0) return normalizeApiBaseForAndroid(manual);
  if (__DEV__) return devApiBase();
  const prod = stripDuplicateApiPath((Config.API_BASE_URL_PRODUCTION ?? "").trim());
  if (prod.length > 0) return normalizeApiBaseForAndroid(prod);
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
