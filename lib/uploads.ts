import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth, readErrorMessage } from "@/lib/fetchWithAuth";

// Uploads a cover image and returns its public URL.
export async function uploadCoverImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  const res = await fetchWithAuth(`${API_BASE_URL}/admin/uploadImage`, {
    method: "POST",
    body,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Image upload failed."));
  }
  return res.text();
}

// Best-effort cleanup for a cover uploaded for a save that then failed, so the
// file doesn't stay orphaned on the backend. Never throws.
export async function discardUploadedImage(url: string): Promise<void> {
  if (!url) return;
  try {
    await fetchWithAuth(`${API_BASE_URL}/admin/uploadImage`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.warn("Could not discard uploaded image", err);
  }
}
