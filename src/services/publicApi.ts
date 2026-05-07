import axios from "axios";
import { getApiBaseUrl } from "../config/env";

export const publicApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 60000,
});

publicApi.interceptors.request.use((config) => {
  config.baseURL = `${getApiBaseUrl()}/api`;
  return config;
});
