import { auth } from "@/lib/firebase";

const TOKEN_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 15_000;

let cachedToken: { value: string; expiresAt: number } | null = null;

// Dedupe concurrent identical GET requests so a double-mount (React 19 strict
// mode / fast navigation) doesn't hit the backend twice.
const inFlightGets = new Map<string, Promise<Response>>();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "network" | "timeout" | "http",
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function clearAuthTokenCache() {
  cachedToken = null;
}

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }
  if (auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    if (token) {
      cachedToken = { value: token, expiresAt: now + TOKEN_TTL_MS };
    }
    return token;
  }
  return null;
}

type FetchOptions = RequestInit & { timeoutMs?: number };

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: FetchOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const method = (rest.method ?? "GET").toUpperCase();
  const url = typeof input === "string" ? input : input.toString();

  // Single-flight only for plain GETs (no custom body, no custom headers the
  // caller expects to be unique). Method + URL is a safe dedupe key.
  const dedupeKey = method === "GET" ? `GET ${url}` : null;
  if (dedupeKey) {
    const existing = inFlightGets.get(dedupeKey);
    if (existing) return existing.then((r) => r.clone());
  }

  const exec = async (): Promise<Response> => {
    const token = await getAuthToken();
    const headers = new Headers(rest.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(input, {
        ...rest,
        headers,
        signal: rest.signal ?? controller.signal,
      });
      return res;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError(
          "Request timed out. The backend may be starting up or unreachable.",
          "timeout"
        );
      }
      // TypeError "Failed to fetch" covers CORS blocks + network/DNS failures.
      throw new ApiError(
        "Cannot reach the backend. This is usually CORS, a cold-start, or a server crash.",
        "network"
      );
    } finally {
      clearTimeout(timer);
    }
  };

  if (!dedupeKey) return exec();

  const promise = exec().finally(() => {
    inFlightGets.delete(dedupeKey);
  });
  inFlightGets.set(dedupeKey, promise);
  return promise.then((r) => r.clone());
}
