"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import {
  authConfig,
  createSessionToken,
  credentialsValid,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export type LoginState = { error?: string };

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_FAILS = 5;

async function clientIdentifier(secret: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { secret } = authConfig();

  if (!secret) {
    return {
      error: "Login isn't configured. Set the AUTH_* environment variables.",
    };
  }
  if (email.length > 320 || password.length > 200) {
    return { error: "Incorrect email or password." };
  }

  const identifier = await clientIdentifier(secret);

  // Throttle by IP. Fail open if the limiter is unavailable (e.g. the table
  // hasn't been created yet) so a legitimate sign-in is never blocked.
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.identifier, identifier),
          gte(loginAttempts.attemptedAt, since),
        ),
      );
    if ((row?.count ?? 0) >= RATE_MAX_FAILS) {
      return { error: "Too many attempts. Try again in about 15 minutes." };
    }
  } catch {
    // limiter unavailable — allow the credential check to proceed
  }

  if (!credentialsValid(email, password)) {
    try {
      await db.insert(loginAttempts).values({ identifier });
    } catch {
      // ignore limiter write failures
    }
    return { error: "Incorrect email or password." };
  }

  try {
    await db.delete(loginAttempts).where(eq(loginAttempts.identifier, identifier));
  } catch {
    // ignore limiter cleanup failures
  }

  const token = await createSessionToken(secret);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/clients");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
