import axios, { AxiosError, AxiosHeaders } from "axios";
import { getApiBaseUrl } from "../config/env";
import { getIdToken } from "./firebaseAuth";

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 120000,
});

api.interceptors.request.use(async (config) => {
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
  return config;
});

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
    return `Sunucuya ulaşılamadı (${base}). Backend’in çalıştığından emin olun; Android emülatörde adres genelde http://10.0.2.2:PORT olmalı (localhost değil).`;
  }
  const d = ax.response?.data?.detail;
  if (Array.isArray(d)) return d.map((x) => String(x)).join("\n");
  if (typeof d === "string") return d;
  if (ax.message) return ax.message;
  return "İstek tamamlanamadı";
}
