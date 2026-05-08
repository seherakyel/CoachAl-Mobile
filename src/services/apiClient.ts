import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "../config/env";
import { getIdToken } from "./firebaseAuth";

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 120000,
});

function logApiFailure(error: AxiosError) {
  if (!__DEV__) return;
  const cfg = error.config as InternalAxiosRequestConfig | undefined;
  let resolvedUrl = "";
  try {
    resolvedUrl = cfg ? api.getUri(cfg) : "";
  } catch {
    resolvedUrl = `${cfg?.baseURL ?? ""}${cfg?.url ?? ""}`;
  }
  const hasAuth = !!(cfg?.headers && AxiosHeaders.from(cfg.headers).get("Authorization"));
  const isMultipart = typeof FormData !== "undefined" && cfg?.data instanceof FormData;
  console.warn(
    `[CoachAI API:error]`,
    error.code ?? "no-code",
    cfg?.method?.toUpperCase() ?? "?",
    resolvedUrl,
    "| status:",
    error.response?.status ?? "—",
    "| authHeader:",
    hasAuth,
    "| multipart:",
    isMultipart,
  );
  if (error.response?.data !== undefined) {
    const raw =
      typeof error.response.data === "string"
        ? error.response.data
        : JSON.stringify(error.response.data);
    console.warn("[CoachAI API:body]", raw.slice(0, 500));
  }
  if (error.message) {
    console.warn("[CoachAI API:message]", error.message);
  }
}

api.interceptors.request.use(async (config) => {
  config.baseURL = `${getApiBaseUrl()}/api`;
  const token = await getIdToken();
  const headers = AxiosHeaders.from(config.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // React Native: boundary ile multipart göndermek için Content-Type'ı axios/runtime bırakmalı
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }
  config.headers = headers;
  if (__DEV__) {
    try {
      const u = api.getUri(config);
      console.log("[CoachAI API:→]", config.method?.toUpperCase(), u, config.data instanceof FormData ? "(multipart)" : "");
    } catch {
      console.log("[CoachAI API:→]", config.method, config.baseURL, config.url);
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
      logApiFailure(error);
    }
    return Promise.reject(error);
  },
);

export function extractDetail(error: unknown): string {
  const ax = error as AxiosError<{ detail?: string | string[] }>;
  const noResponse = !ax.response;
  if (
    noResponse &&
    (ax.code === "ERR_NETWORK" ||
      ax.code === "ECONNABORTED" ||
      (typeof ax.message === "string" && ax.message.toLowerCase().includes("network")))
  ) {
    const base = getApiBaseUrl();
    return (
      `CoachAI API'ye ulaşılamadı (${base}). ` +
      `Not: Giriş ve kayıt Google Firebase üzerinden çalışır; CV yükleme ve panel bu adresteki backend'e gider (aynı bağlantı değil). ` +
      `Android emülatörde 127.0.0.1 genelde Mac'e gitmez: proje klasöründe npm run adb:reverse veya npm run present:android. ` +
      `Backend: uvicorn ... --host 0.0.0.0 --port 8000. Konsolda [CoachAI API] loglarına bakın (__DEV__).`
    );
  }
  const d = ax.response?.data?.detail;
  if (Array.isArray(d)) return d.map((x) => String(x)).join("\n");
  if (typeof d === "string") return d;
  if (ax.message) return ax.message;
  return "İstek tamamlanamadı";
}
