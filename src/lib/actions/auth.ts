"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authConfig,
  createSessionToken,
  credentialsValid,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export type LoginState = { error?: string };

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
  if (!credentialsValid(email, password)) {
    return { error: "Incorrect email or password." };
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
