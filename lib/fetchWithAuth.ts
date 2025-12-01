import { auth } from "@/lib/firebase";

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const token = auth ? await auth.currentUser?.getIdToken() : null;
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
