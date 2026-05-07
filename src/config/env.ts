import Config from "react-native-config";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://api.coachai.com";

function devApiBase(): string {
  return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
}

/** Android emülatörde `localhost` / `127.0.0.1` makineye değil emülatöre işaret eder; host için `10.0.2.2` gerekir. */
function normalizeApiBaseForAndroid(url: string): string {
  if (Platform.OS !== "android") return url;
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
