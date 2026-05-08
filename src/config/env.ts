import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

/** axios zaten `/api` ekler; `.env`'de sonda `/api` yazılırsa çift `/api/api` olur. */
function stripDuplicateApiPath(url: string): string {
  let u = url.replace(/\/$/, "");
  if (u.toLowerCase().endsWith("/api")) {
    u = u.slice(0, -4).replace(/\/$/, "");
  }
  return u;
}

/**
 * Android emülatörde `localhost` / `127.0.0.1` varsayılan olarak emülatörün kendisidir.
 * Host makineye gitmek için genelde `10.0.2.2` kullanılır.
 * `10.0.0.2` yaygın bir yazım hatasıdır (doğru: `10.0.2.2`).
 * `adb reverse tcp:PORT tcp:PORT` kullanıyorsanız `.env` içinde ANDROID_USE_DEVICE_LOCALHOST=true
 * ve API_BASE_URL=http://127.0.0.1:PORT bırakın (127.0.0.1'i 10.0.2.2'ye çevirmeyiz).
 */
function normalizeApiBaseForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
  let u = url.replace(/10\.0\.0\.2/gi, "10.0.2.2");
  const keepLocalhost = (Config.ANDROID_USE_DEVICE_LOCALHOST ?? "").trim().toLowerCase() === "true";
  if (keepLocalhost) return u;
  return u
    .replace(/127\.0\.0\.1/gi, "10.0.2.2")
    .replace(/localhost/gi, "10.0.2.2");
}

export function getApiBaseUrl(): string {
  const manual = stripDuplicateApiPath((Config.API_BASE_URL ?? "").trim());
  if (manual.length > 0) return normalizeApiBaseForAndroid(manual);
  if (__DEV__) return devApiBase();
  const prod = stripDuplicateApiPath((Config.API_BASE_URL_PRODUCTION ?? "").trim());
  if (prod.length > 0) return normalizeApiBaseForAndroid(prod);
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
