// True for absolute http(s) URLs; guards <Image src> against bad stored values.
export function isValidHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Only allow same-site paths like "/game/12" as post-login redirects, so a
// crafted ?next=https://evil.example link can't send the user off-site.
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}
