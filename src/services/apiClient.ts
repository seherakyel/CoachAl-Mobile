import axios, { AxiosError } from "axios";
import { getApiBaseUrl } from "../config/env";
import { getIdToken } from "./firebaseAuth";

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 120000,
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractDetail(error: unknown): string {
  const ax = error as AxiosError<{ detail?: string | string[] }>;
  const d = ax.response?.data?.detail;
  if (Array.isArray(d)) return d.map((x) => String(x)).join("\n");
  if (typeof d === "string") return d;
  if (ax.message) return ax.message;
  return "İstek tamamlanamadı";
}
