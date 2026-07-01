import "server-only";
import { del, put } from "@vercel/blob";

// Photo storage on Vercel Blob. Objects are public but have unguessable URLs;
// the DB row that references them is protected server-side per user.
// Key layout: "wine-photos/<user_id>/<tasting_id>-<rand>.<ext>".

export async function uploadPhoto(
  userId: string,
  tastingId: string,
  file: File,
): Promise<{ url: string; pathname: string }> {
  const ext = fileExt(file);
  const key = `wine-photos/${userId}/${tastingId}.${ext}`;
  const blob = await put(key, file, {
    access: "public",
    contentType: file.type || undefined,
    addRandomSuffix: true, // avoids collisions / stale cache on re-upload
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deletePhoto(pathnameOrUrl: string): Promise<void> {
  await del(pathnameOrUrl);
}

function fileExt(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return (fromType || "jpg").toLowerCase();
}
