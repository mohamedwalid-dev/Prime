import axios from "axios";


export const apiBaseUrl =
  import.meta.env.VITE_API_URL || "https://render-backend-gnhu.onrender.com/v1";

const client = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// باقي الملف كما هو...

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

const publicRoutes = ["/", "/login", "/register"];

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.includes(currentPath);

      // Allow unauthenticated access to public pages and avoid redirect loops.
      if (!isPublicRoute && currentPath !== "/login") {
        window.location.replace("/login");
      }
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