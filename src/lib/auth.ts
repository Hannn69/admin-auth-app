import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const accessTokenTtlMinutes = parsePositiveNumber(
  process.env.ACCESS_TOKEN_TTL_MINUTES,
  15
);
const refreshTokenTtlDays = parsePositiveNumber(
  process.env.REFRESH_TOKEN_TTL_DAYS,
  7
);

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: `${accessTokenTtlMinutes}m`,
  });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: `${refreshTokenTtlDays}d`,
  });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, jwtSecret) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function accessTokenMaxAgeSeconds() {
  return accessTokenTtlMinutes * 60;
}

export function refreshTokenMaxAgeSeconds() {
  return refreshTokenTtlDays * 24 * 60 * 60;
}

export function refreshTokenExpiresAt() {
  return new Date(Date.now() + refreshTokenMaxAgeSeconds() * 1000);
}

export function baseCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
