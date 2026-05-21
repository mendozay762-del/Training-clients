"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-card bg-card p-6">
        <h1 className="text-xl font-semibold text-text-primary">
          Trainer Clients
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to continue.</p>

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-accent-red">{state.error}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
