import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defaultLessons } from "../src/data/lessons.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "database.json");
const port = Number(process.env.PORT || 3001);
const adminInviteCode = process.env.ADMIN_INVITE_CODE || "LINGUA_ADMIN";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function createInitialDatabase() {
  await mkdir(dataDirectory, { recursive: true });

  const initialDatabase = {
    users: [],
    sessions: [],
    lessons: defaultLessons,
    results: [],
  };

  await writeFile(databasePath, JSON.stringify(initialDatabase, null, 2), "utf8");
  return initialDatabase;
}

async function readDatabase() {
  try {
    const content = await readFile(databasePath, "utf8");
    const database = JSON.parse(content);

    return {
      users: Array.isArray(database.users) ? database.users : [],
      sessions: Array.isArray(database.sessions) ? database.sessions : [],
      lessons: Array.isArray(database.lessons) ? database.lessons : defaultLessons,
      results: Array.isArray(database.results) ? database.results : [],
    };
  } catch {
    return createInitialDatabase();
  }
}

async function writeDatabase(database) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(databasePath, JSON.stringify(database, null, 2), "utf8");
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload));
}

function getToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

function getSessionUser(database, request) {
  const token = getToken(request);
  const session = database.sessions.find((item) => item.token === token);

  if (!session) {
    return null;
  }

  return database.users.find((user) => user.id === session.userId) || null;
}

function requireUser(database, request, response) {
  const user = getSessionUser(database, request);

  if (!user) {
    sendJson(response, 401, { message: "Требуется вход в аккаунт." });
    return null;
  }

  return user;
}

function requireAdmin(database, request, response) {
  const user = requireUser(database, request, response);

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    sendJson(response, 403, { message: "Доступ разрешен только администратору." });
    return null;
  }

  return user;
}

function normalizeLesson(lesson, fallbackId) {
  return {
    id: Number(lesson.id || fallbackId),
    title: String(lesson.title || "").trim(),
    level: String(lesson.level || "A1").trim(),
    description: String(lesson.description || "").trim(),
    words: Array.isArray(lesson.words) ? lesson.words : [],
    questions: Array.isArray(lesson.questions) ? lesson.questions : [],
  };
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const database = await readDatabase();

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readBody(request);
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const password = String(body.password || "");

      if (!name || !email || password.length < 6) {
        sendJson(response, 400, { message: "Заполните имя, email и пароль от 6 символов." });
        return;
      }

      if (database.users.some((user) => user.email === email)) {
        sendJson(response, 409, { message: "Пользователь с таким email уже существует." });
        return;
      }

      const user = {
        id: randomUUID(),
        name,
        email,
        passwordHash: hashPassword(password),
        role: String(body.adminCode || "").trim() === adminInviteCode ? "admin" : "student",
        createdAt: new Date().toLocaleString(),
      };
      const token = randomUUID();

      database.users.push(user);
      database.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
      await writeDatabase(database);

      sendJson(response, 201, { user: publicUser(user), token });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(request);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = database.users.find((item) => item.email === email);

      if (!user || user.passwordHash !== hashPassword(password)) {
        sendJson(response, 401, { message: "Неверный email или пароль." });
        return;
      }

      const token = randomUUID();
      database.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
      await writeDatabase(database);

      sendJson(response, 200, { user: publicUser(user), token });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      const user = requireUser(database, request, response);

      if (!user) {
        return;
      }

      sendJson(response, 200, { user: publicUser(user) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const token = getToken(request);
      database.sessions = database.sessions.filter((session) => session.token !== token);
      await writeDatabase(database);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/lessons") {
      sendJson(response, 200, { lessons: database.lessons });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/lessons") {
      if (!requireAdmin(database, request, response)) {
        return;
      }

      const body = await readBody(request);
      const lesson = normalizeLesson(body, Date.now());

      database.lessons.push(lesson);
      await writeDatabase(database);
      sendJson(response, 201, { lesson });
      return;
    }

    const lessonMatch = url.pathname.match(/^\/api\/lessons\/(\d+)$/);

    if (lessonMatch && request.method === "PUT") {
      if (!requireAdmin(database, request, response)) {
        return;
      }

      const lessonId = Number(lessonMatch[1]);
      const lessonIndex = database.lessons.findIndex((lesson) => lesson.id === lessonId);

      if (lessonIndex === -1) {
        sendJson(response, 404, { message: "Урок не найден." });
        return;
      }

      const body = await readBody(request);
      const lesson = normalizeLesson({ ...body, id: lessonId }, lessonId);

      database.lessons[lessonIndex] = lesson;
      await writeDatabase(database);
      sendJson(response, 200, { lesson });
      return;
    }

    if (lessonMatch && request.method === "DELETE") {
      if (!requireAdmin(database, request, response)) {
        return;
      }

      const lessonId = Number(lessonMatch[1]);
      database.lessons = database.lessons.filter((lesson) => lesson.id !== lessonId);
      database.results = database.results.filter((result) => result.lessonId !== lessonId);
      await writeDatabase(database);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/results") {
      const user = requireUser(database, request, response);

      if (!user) {
        return;
      }

      sendJson(response, 200, {
        results: database.results.filter((result) => result.userId === user.id),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/results") {
      const user = requireUser(database, request, response);

      if (!user) {
        return;
      }

      const body = await readBody(request);
      const result = {
        userId: user.id,
        lessonId: Number(body.lessonId),
        lessonTitle: String(body.lessonTitle || ""),
        level: String(body.level || ""),
        score: Number(body.score || 0),
        total: Number(body.total || 0),
        percent: Number(body.percent || 0),
        completedAt: new Date().toLocaleString(),
      };

      database.results = database.results.filter(
        (item) => !(item.userId === user.id && item.lessonId === result.lessonId)
      );
      database.results.push(result);
      await writeDatabase(database);
      sendJson(response, 201, { result });
      return;
    }

    if (request.method === "DELETE" && url.pathname === "/api/results") {
      const user = requireUser(database, request, response);

      if (!user) {
        return;
      }

      database.results = database.results.filter((result) => result.userId !== user.id);
      await writeDatabase(database);
      sendJson(response, 200, { ok: true });
      return;
    }

    sendJson(response, 404, { message: "Маршрут API не найден." });
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Ошибка сервера." });
  }
}

createServer(handleRequest).listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
