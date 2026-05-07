import axios from "axios";
import { getApiBaseUrl } from "../config/env";

export const publicApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  timeout: 60000,
});
