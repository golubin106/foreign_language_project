import {
  apiRequest,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  saveSession,
} from "./api";

export function getCurrentUser() {
  const user = getStoredUser();

  if (!user || !user.email) {
    return null;
  }

  return {
    ...user,
    role: user.role === "admin" ? "admin" : "student",
  };
}

export function isAuthenticated() {
  return Boolean(getStoredToken() && getCurrentUser());
}

export function isAdmin() {
  return isAuthenticated() && getCurrentUser()?.role === "admin";
}

export async function createUser({ name, email, password, adminCode }) {
  const session = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, adminCode }),
  });

  saveSession(session);
  return session.user;
}

export async function loginUser({ email, password }) {
  const session = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveSession(session);
  return session.user;
}

export async function clearSession() {
  const token = getStoredToken();
  clearStoredSession();

  if (!token) {
    return;
  }

  try {
    await apiRequest("/auth/logout", { method: "POST" }, token);
  } catch {
    // Local logout should still succeed if the server is unavailable.
  }
}
