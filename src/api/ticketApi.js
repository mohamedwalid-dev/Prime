import { getAuthToken, handleUnauthorized } from "./client";

const API_BASE = "https://render-backend-gnhu.onrender.com/v1/tickets";

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
    throw new Error(payload.message || payload.error || "Ticket request failed");
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

export const getTickets = () => request();

export const getTicketById = (ticketId) => request(`/${ticketId}`);

export const createTicket = (ticketData) =>
  request("", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });

export const addTicketMessage = (ticketId, messageData) =>
  request(`/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify(messageData),
  });

export const updateTicketStatus = (ticketId, status) =>
  request(`/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const assignTicketToSupportAgent = (ticketId, agentId) =>
  request(`/${ticketId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ agentId }),
  });

export const updateTicketDepartment = (ticketId, relatedDepartment) =>
  request(`/${ticketId}/department`, {
    method: "PATCH",
    body: JSON.stringify({ relatedDepartment }),
  });
