import { clearAuthStorage, getAuthToken, http } from "./client";
import { ENDPOINTS } from "./config";

const KEYS = {
  TOKEN: "token",
  USER: "user",
};

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USER));
  } catch {
    return null;
  }
};

const extractAuthPayload = (payload) => {
  const firstDataItem = Array.isArray(payload?.data) ? payload.data[0] : payload?.data;

  return {
    token: payload?.token || firstDataItem?.token || null,
    user: payload?.user || firstDataItem?.user || firstDataItem || null,
  };
};

export const tokenStorage = {
  getAccessToken: () => getAuthToken(),
  getRefreshToken: () => null,
  getUser: () => parseStoredUser(),

  setTokens: (access) => {
    if (access) localStorage.setItem(KEYS.TOKEN, access);
  },

  setUser: (user) => {
    if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clear: () => {
    clearAuthStorage();
  },

  isLoggedIn: () => !!getAuthToken(),
};

const authService = {
  login: async ({ email, password }) => {
    const result = await http.post(ENDPOINTS.AUTH.LOGIN, { email, password });

    if (result.data) {
      const { token, user } = extractAuthPayload(result.data);
      tokenStorage.setTokens(token);
      tokenStorage.setUser(user);
    }

    return result;
  },

  logout: async () => {
    const result = await http.post(ENDPOINTS.AUTH.LOGOUT, {});
    tokenStorage.clear();
    return result;
  },

  getMe: () => {
    return http.get(ENDPOINTS.AUTH.ME);
  },

  resetPassword: (email) => {
    return http.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  },
};

export default authService;
