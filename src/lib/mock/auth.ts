import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const MOCK_JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "mock-nutripilot-secret-key-123"
);

type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

const users = new Map<string, StoredUser>();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(keyBuf, derived);
}

async function ensureDemoUser() {
  const email = "demo@nutripilot.app";
  if (!users.has(email)) {
    users.set(email, {
      id: "mock-user-123",
      email,
      name: "Alex Morgan",
      passwordHash: await hashPassword("password123"),
    });
  }
}

function enforceAuthRateLimit(email: string) {
  const now = Date.now();
  const current = loginAttempts.get(email) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > current.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  if (current.count >= 20) {
    throw new Error("Too many authentication attempts. Try again later.");
  }
  current.count += 1;
  loginAttempts.set(email, current);
}

export const mockAuthService = {
  verifyCredentials: async (email: string, password: string) => {
    await ensureDemoUser();
    enforceAuthRateLimit(email.toLowerCase());
    const user = users.get(email.toLowerCase());
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error("Invalid credentials");
    }
    return { id: user.id, email: user.email, name: user.name };
  },

  registerUser: async (email: string, password: string, name?: string) => {
    await ensureDemoUser();
    enforceAuthRateLimit(email.toLowerCase());
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const key = email.toLowerCase();
    if (users.has(key)) {
      throw new Error("An account with this email already exists");
    }
    const user: StoredUser = {
      id: `user-${Date.now()}`,
      email: key,
      name: name || key.split("@")[0],
      passwordHash: await hashPassword(password),
    };
    users.set(key, user);
    return { id: user.id, email: user.email, name: user.name };
  },

  changePassword: async (email: string, current: string, next: string) => {
    await ensureDemoUser();
    const user = users.get(email.toLowerCase());
    if (!user || !(await verifyPassword(current, user.passwordHash))) {
      throw new Error("Current password is incorrect");
    }
    if (next.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    user.passwordHash = await hashPassword(next);
    return true;
  },

  deleteUser: (email: string) => {
    users.delete(email.toLowerCase());
  },

  createToken: async (user: { id: string; email: string; name?: string }) => {
    return new SignJWT({ userId: user.id, email: user.email, name: user.name || user.email.split("@")[0] })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(MOCK_JWT_SECRET);
  },

  verifyToken: async (token: string) => {
    try {
      const { payload } = await jwtVerify(token, MOCK_JWT_SECRET);
      return payload;
    } catch {
      return null;
    }
  },
};
