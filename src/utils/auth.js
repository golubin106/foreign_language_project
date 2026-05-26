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

  if (globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest(
      "SHA-256",
      passwordData
    );

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return Array.from(passwordData)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
    const migratedUser = {
      ...user,
      passwordHash,
      role: user.role === "admin" ? "admin" : "student",
    };

    delete migratedUser.password;
    writeJson(USER_KEY, migratedUser);

    return true;
  }

  return false;
}
