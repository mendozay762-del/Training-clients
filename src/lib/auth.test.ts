import { describe, it, expect } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  credentialsValid,
} from "./auth";

describe("session tokens", () => {
  const secret = "test-secret-abc-123";

  it("round-trips a valid token", async () => {
    const token = await createSessionToken(secret);
    expect(await verifySessionToken(token, secret)).toBe(true);
  });

  it("rejects tampering and the wrong secret", async () => {
    const token = await createSessionToken(secret);
    expect(await verifySessionToken(token + "x", secret)).toBe(false);
    expect(await verifySessionToken(token, "different-secret")).toBe(false);
  });

  it("rejects undefined / malformed tokens", async () => {
    expect(await verifySessionToken(undefined, secret)).toBe(false);
    expect(await verifySessionToken("no-separator", secret)).toBe(false);
  });
});

describe("credentialsValid", () => {
  it("matches configured creds (email case-insensitive) and rejects wrong ones", () => {
    process.env.AUTH_EMAIL = "Coach@Example.com";
    process.env.AUTH_PASSWORD = "s3cret-pass";

    expect(credentialsValid("coach@example.com", "s3cret-pass")).toBe(true);
    expect(credentialsValid("coach@example.com", "wrong")).toBe(false);
    expect(credentialsValid("someone@else.com", "s3cret-pass")).toBe(false);
  });
});
