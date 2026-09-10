import { cookies } from "next/headers";

export const GUEST_SESSION_COOKIE_NAME = "guest_session_id";

export async function getGuestSessionId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getOrCreateGuestSessionId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
    if (existing) {
      return existing;
    }
    const newId = crypto.randomUUID();
    try {
      cookieStore.set(GUEST_SESSION_COOKIE_NAME, newId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      // Server Component render may not allow mutating cookies directly;
      // middleware handles assignment on initial request
    }
    return newId;
  } catch {
    return crypto.randomUUID();
  }
}
