import { getAuthToken, handleUnauthorized } from "./client";

const API_BASE = "https://render-backend-gnhu.onrender.com/v1/chats";

const getAuthHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Internal chat request failed");
  }

  return payload;
};

const request = async (path = "", options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
};

export const getInternalChatsByTicket = (ticketId) => request(`/ticket/${ticketId}`);

export const addInternalChatMessage = (chatId, { text, attachments = [] }) =>
  request(`/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text, attachments }),
  });
