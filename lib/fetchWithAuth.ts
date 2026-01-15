import { auth } from "@/lib/firebase";

const TOKEN_TTL_MS = 5 * 60 * 1000;
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  let token: string | null = null;
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now) {
    token = cachedToken.value;
  } else if (auth?.currentUser) {
    token = await auth.currentUser.getIdToken();
    if (token) {
      cachedToken = { value: token, expiresAt: now + TOKEN_TTL_MS };
    }
  }
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
