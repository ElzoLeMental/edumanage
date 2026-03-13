const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    // Tenter un rafraîchissement du token
    const refreshed = await refreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }

  return res;
}

async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return true;
  }
  return false;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const auth = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      return { ok: true, user: data.user };
    }
    return { ok: false, error: "Email ou mot de passe incorrect." };
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  async me() {
    const res = await request("/auth/me/");
    if (res?.ok) return res.json();
    return null;
  },
};

// ─── UTILISATEURS ─────────────────────────────────────────────────────────────
export const users = {
  list: () => request("/auth/users/").then(r => r.json()),
  create: (data) => request("/auth/users/", { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
  update: (id, data) => request(`/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r?.json() ?? null),
  delete: (id) => request(`/auth/users/${id}/`, { method: "DELETE" }),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboard = {
  stats: () => request("/dashboard/").then(r => r.json()),
};

// ─── ÉLÈVES ───────────────────────────────────────────────────────────────────
async function safeJson(res) {
  if (!res) return null;
  try { return await res.json(); } catch { return null; }
}

export const eleves = {
  list: () => request("/eleves/").then(safeJson),
  get: (id) => request(`/eleves/${id}/`).then(safeJson),
  create: (data) => request("/eleves/", { method: "POST", body: JSON.stringify(data) }).then(safeJson),
  update: (id, data) => request(`/eleves/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(safeJson),
  delete: (id) => request(`/eleves/${id}/`, { method: "DELETE" }),
  notes: (id) => request(`/eleves/${id}/notes/`).then(r => r?.json()),
  addNote: (id, data) => request(`/eleves/${id}/notes/`, { method: "POST", body: JSON.stringify(data) }).then(r => r?.json()),
  deleteNote: (noteId) => request(`/notes/${noteId}/`, { method: "DELETE" }),
  updateNote: (noteId, data) => request(`/notes/${noteId}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r?.json()),
  bulletin: (id, trimestre) => {
    const q = trimestre ? `?trimestre=${trimestre}` : "";
    return request(`/eleves/${id}/bulletin/${q}`).then(safeJson);
  },
};

// ─── ENSEIGNANTS ──────────────────────────────────────────────────────────────
export const enseignants = {
  list: () => request("/enseignants/").then(r => r.json()),
  get: (id) => request(`/enseignants/${id}/`).then(r => r.json()),
  create: (data) => request("/enseignants/", { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
  update: (id, data) => request(`/enseignants/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id) => request(`/enseignants/${id}/`, { method: "DELETE" }),
};

// ─── CLASSES ──────────────────────────────────────────────────────────────────
export const classes = {
  list: () => request("/classes/").then(r => r.json()),
  create: (data) => request("/classes/", { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
  update: (id, data) => request(`/classes/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id) => request(`/classes/${id}/`, { method: "DELETE" }),
};

// ─── FINANCES ─────────────────────────────────────────────────────────────────
export const finances = {
  list: () => request("/finances/").then(r => r.json()),
  create: (data) => request("/finances/", { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
  update: (id, data) => request(`/finances/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id) => request(`/finances/${id}/`, { method: "DELETE" }),
};

// ─── EMPLOI DU TEMPS ──────────────────────────────────────────────────────────
export const emploi = {
  list: () => request("/emploi-du-temps/").then(r => r.json()),
  create: (data) => request("/emploi-du-temps/", { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
  update: (id, data) => request(`/emploi-du-temps/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id) => request(`/emploi-du-temps/${id}/`, { method: "DELETE" }),
};

// ─── CAHIER DE TEXTE ──────────────────────────────────────────────────────────
export const cahier = {
  list: (params) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/cahier/${q}`).then(safeJson);
  },
  create: (data) => request("/cahier/", { method: "POST", body: JSON.stringify(data) }).then(safeJson),
  update: (id, data) => request(`/cahier/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(safeJson),
  delete: (id) => request(`/cahier/${id}/`, { method: "DELETE" }),
};

// ─── ABSENCES ─────────────────────────────────────────────────────────────────
export const absences = {
  list: (params) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/absences/${q}`).then(safeJson);
  },
  create: (data) => request("/absences/", { method: "POST", body: JSON.stringify(data) }).then(safeJson),
  update: (id, data) => request(`/absences/${id}/`, { method: "PATCH", body: JSON.stringify(data) }).then(safeJson),
  delete: (id) => request(`/absences/${id}/`, { method: "DELETE" }),
};
