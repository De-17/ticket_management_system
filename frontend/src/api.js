const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail = data?.detail || "Request failed";
    throw new Error(detail);
  }
  return data;
}

export async function listTickets(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  const path = qs ? `/api/tickets/?${qs}` : "/api/tickets/";
  return request(path);
}

export async function createTicket(payload) {
  return request("/api/tickets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchTicket(id, payload) {
  return request(`/api/tickets/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function classifyDescription(description) {
  return request("/api/tickets/classify/", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export async function fetchStats() {
  return request("/api/tickets/stats/");
}
