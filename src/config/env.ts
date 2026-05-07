import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

/**
 * Android emülatörde `localhost` / `127.0.0.1` varsayılan olarak emülatörün kendisidir.
 * Host makineye gitmek için genelde `10.0.2.2` kullanılır.
 * `adb reverse tcp:PORT tcp:PORT` kullanıyorsanız `.env` içinde ANDROID_USE_DEVICE_LOCALHOST=true
 * ve API_BASE_URL=http://127.0.0.1:PORT birakin (127.0.0.1'i 10.0.2.2'ye cevirmeyiz).
 */
function normalizeApiBaseForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
  const keepLocalhost = (Config.ANDROID_USE_DEVICE_LOCALHOST ?? "").trim().toLowerCase() === "true";
  if (keepLocalhost) return url;
  return url
    .replace(/127\.0\.0\.1/gi, "10.0.2.2")
    .replace(/localhost/gi, "10.0.2.2");
}

export function getApiBaseUrl(): string {
  const manual = (Config.API_BASE_URL ?? "").trim();
  if (manual.length > 0) return normalizeApiBaseForAndroid(manual.replace(/\/$/, ""));
  if (__DEV__) return devApiBase();
  const prod = (Config.API_BASE_URL_PRODUCTION ?? "").trim();
  if (prod.length > 0) return normalizeApiBaseForAndroid(prod.replace(/\/$/, ""));
  return PRODUCTION_API_BASE.replace(/\/$/, "");
}
