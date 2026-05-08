import axios, { AxiosError, AxiosHeaders } from "axios";
import { getApiBaseUrl } from "../config/env";
import { getIdToken } from "./firebaseAuth";

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 120_000,
});

api.interceptors.request.use(async (config) => {
  config.baseURL = `${getApiBaseUrl()}/api`;
  const token = await getIdToken();
  const headers = AxiosHeaders.from(config.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }
  config.headers = headers;
  return config;
});

export function extractDetail(error: unknown): string {
  if (isAbortLike(error)) {
    return "İstek zaman aşımına uğradı. Bir süre sonra tekrar deneyin.";
  }

  const ax = error as AxiosError<{ detail?: string | string[] }>;

  if (!ax.response && ax.code === "ECONNABORTED") {
    return "İstek zaman aşımına uğradı. Bir süre sonra tekrar deneyin.";
  }

  if (!ax.response && (ax.code === "ERR_NETWORK" || isNetworkMsg(ax.message))) {
    return `API'ye ulaşılamadı (${getApiBaseUrl()}). Bağlantı ve .env.local içindeki API_BASE_URL değerini kontrol edin.`;
  }

  const d = ax.response?.data?.detail;
  if (Array.isArray(d)) return d.map(String).join("\n");
  if (typeof d === "string") return d;
  if (ax.message) return ax.message;
  if (error instanceof Error && error.message) return error.message;
  return "İstek tamamlanamadı";
}

function isAbortLike(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const name = "name" in e ? String((e as { name?: unknown }).name) : "";
  if (name === "AbortError") return true;
  const msg = "message" in e ? String((e as { message?: unknown }).message) : "";
  return /aborted/i.test(msg);
}

function isNetworkMsg(msg: unknown): boolean {
  return typeof msg === "string" && msg.toLowerCase().includes("network");
}
