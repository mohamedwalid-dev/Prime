import axios from "axios";

export const apiBaseUrl =
  import.meta.env.VITE_API_URL || "https://render-backend-gnhu.onrender.com/v1";

const AUTH_STORAGE_KEYS = [
  "token",
  "user",
  "auth",
  "authUser",
  "synergy_access_token",
  "synergy_refresh_token",
  "synergy_user",
];

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getAuthToken = () => {
  if (!canUseStorage()) return null;
  return localStorage.getItem("token");
};

export const clearAuthStorage = () => {
  if (!canUseStorage()) return;
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const handleUnauthorized = () => {
  clearAuthStorage();

  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const normalizeError = (err) => {
  const status = err?.response?.status ?? null;

  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed";

  const data = err?.response?.data?.data ?? [];

  return { status, message, data };
};

client.interceptors.request.use((config) => {
  const token = getAuthToken();

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

export async function requestSafe(fn) {
  try {
    const res = await fn();

    return {
      data: res.data,
      error: null,
      status: res.status,
    };
  } catch (err) {
    if (err?.name === "CanceledError") {
      return { data: null, error: null };
    }

    const normalized = normalizeError(err);

    return {
      data: null,
      error: normalized.message,
      errorData: Array.isArray(normalized.data) ? normalized.data : [],
      status: normalized.status,
    };
  }
}

export const http = {
  get: (url, config) => requestSafe(() => client.get(url, config)),
  post: (url, data, config) => requestSafe(() => client.post(url, data, config)),
  patch: (url, data, config) => requestSafe(() => client.patch(url, data, config)),
  put: (url, data, config) => requestSafe(() => client.put(url, data, config)),
  delete: (url, config) => requestSafe(() => client.delete(url, config)),
};

export default client;
