import { readJson, removeItem, writeJson } from "./storage";

const USER_KEY = "user";
const SESSION_KEY = "isLoggedIn";
const ADMIN_INVITE_CODE = "LINGUA_ADMIN";

export function getCurrentUser() {
  const user = readJson(USER_KEY, null);

  if (!user || !user.email) {
    return null;
  }

  return {
    ...user,
    role: user.role === "admin" ? "admin" : "student",
  };
}

export function isAuthenticated() {
  return localStorage.getItem(SESSION_KEY) === "true" && Boolean(getCurrentUser());
}

export function isAdmin() {
  return isAuthenticated() && getCurrentUser()?.role === "admin";
}

export function startSession() {
  localStorage.setItem(SESSION_KEY, "true");
}

export function clearSession() {
  removeItem(SESSION_KEY);
}

export async function hashPassword(password) {
  const passwordData = new TextEncoder().encode(password);

  if (crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return btoa(unescape(encodeURIComponent(password)));
}

export async function createUser({ name, email, password, adminCode }) {
  const passwordHash = await hashPassword(password);
  const role = adminCode.trim() === ADMIN_INVITE_CODE ? "admin" : "student";

  const user = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toLocaleString(),
  };

  writeJson(USER_KEY, user);
  startSession();

  return user;
}

export async function verifyPassword(user, password) {
  const passwordHash = await hashPassword(password);

  if (user.passwordHash) {
    return user.passwordHash === passwordHash;
  }

  if (user.password === password) {
    writeJson(USER_KEY, {
      ...user,
      password: undefined,
      passwordHash,
      role: user.role === "admin" ? "admin" : "student",
    });

    return true;
  }

  return false;
}
