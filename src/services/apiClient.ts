import axios, { AxiosError, AxiosHeaders } from "axios";
import { getApiBaseUrl } from "../config/env";
import { getIdToken } from "./firebaseAuth";

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 120000,
});

api.interceptors.request.use(async (config) => {
  config.baseURL = `${getApiBaseUrl()}/api`;
  const token = await getIdToken();
  const headers = AxiosHeaders.from(config.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }
  config.headers = headers;
  return config;
});

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String((error as { name?: unknown }).name) : "";
  if (name === "AbortError") return true;
  const msg = "message" in error ? String((error as { message?: unknown }).message) : "";
  return /aborted|abort/i.test(msg);
}

export function extractDetail(error: unknown): string {
  if (isAbortError(error)) {
    return "İstek zaman aşımına uğradı (CV işlemi uzun sürebilir). Bir süre sonra tekrar deneyin.";
  }
  const ax = error as AxiosError<{ detail?: string | string[] }>;
  if (!ax.response && ax.code === "ECONNABORTED") {
    return "İstek zaman aşımına uğradı (CV işlemi uzun sürebilir). Bir süre sonra tekrar deneyin.";
  }
  const noResponse = !ax.response;
  if (
    noResponse &&
    (ax.code === "ERR_NETWORK" ||
      (typeof ax.message === "string" && ax.message.toLowerCase().includes("network")))
  ) {
    return `API'ye ulaşılamadı (${getApiBaseUrl()}). Bağlantı ve .env.local içindeki API_BASE_URL değerini kontrol edin.`;
  }
  const d = ax.response?.data?.detail;
  if (Array.isArray(d)) return d.map((x) => String(x)).join("\n");
  if (typeof d === "string") return d;
  if (ax.message) return ax.message;
  return "İstek tamamlanamadı";
}
