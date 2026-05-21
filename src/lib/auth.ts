// Single-user authentication helpers.
//
// Designed to run in both the Node (server actions) and Edge (middleware)
// runtimes, so it relies only on Web APIs (crypto.subtle, btoa/atob,
// TextEncoder). When the AUTH_* environment variables are not all set the
// login gate stays dormant and the app is reachable without signing in.

export const SESSION_COOKIE = "tc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function authConfig() {
  return {
    email: readEnv("AUTH_EMAIL"),
    password: readEnv("AUTH_PASSWORD"),
    secret: readEnv("AUTH_SECRET"),
  };
}

export function isAuthConfigured(): boolean {
  const { email, password, secret } = authConfig();
  return Boolean(email && password && secret);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: expiresAt })),
  );
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = await sign(payload, secret);
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const decoded = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as { exp?: unknown };
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function credentialsValid(email: string, password: string): boolean {
  const { email: expectedEmail, password: expectedPassword } = authConfig();
  if (!expectedEmail || !expectedPassword) return false;
  const emailMatch = timingSafeEqual(
    email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase(),
  );
  const passwordMatch = timingSafeEqual(password, expectedPassword);
  return emailMatch && passwordMatch;
}
