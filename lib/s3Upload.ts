import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type PresignResponse = {
  url: string;
  publicUrl: string;
  key?: string;
  expiresInSeconds?: number;
};

export async function uploadImageWithPresign(file: File): Promise<string> {
  const params = new URLSearchParams();
  params.set("filename", file.name);
  if (file.type) {
    params.set("contentType", file.type);
  }
  params.set("expiresSeconds", "900");

  try {
    const presignRes = await fetchWithAuth(`${API_BASE_URL}/admin/s3/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!presignRes.ok) {
      throw new Error("Presign failed.");
    }

    const presignData = (await presignRes.json()) as PresignResponse;
    if (!presignData?.url || !presignData?.publicUrl) {
      throw new Error("Invalid presign response.");
    }

    const uploadRes = await fetch(presignData.url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("S3 upload failed.");
    }

    return presignData.publicUrl;
  } catch (error) {
    const uploadData = new FormData();
    uploadData.append("image", file);

    const fallbackRes = await fetchWithAuth(`${API_BASE_URL}/admin/uploadImage`, {
      method: "POST",
      body: uploadData,
    });

    if (!fallbackRes.ok) {
      throw error instanceof Error ? error : new Error("Image upload failed.");
    }

    return await fallbackRes.text();
  }
}
