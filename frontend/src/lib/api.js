import axios from "axios";
import { useAuth } from "../store/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8090";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout();
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from an axios error. */
export function apiError(e, fallback = "Something went wrong.") {
  return e?.response?.data?.message || e?.message || fallback;
}
