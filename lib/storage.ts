import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { createId } from "@paralleldrive/cuid2";

// File storage behind a small interface so the provider can be swapped later.
// Currently Cloudinary, configured by CLOUDINARY_URL (cloudinary://key:secret@cloud).
// Documents are uploaded as private raw files and served through short-lived signed
// links; logos are public images because students see them on drive pages.

export type UploadKind = "RESUME" | "AUTH_LETTER" | "LOGO";

const rules: Record<UploadKind, { maxBytes: number; types: Record<string, string>; label: string }> = {
  RESUME: { maxBytes: 2 * 1024 * 1024, types: { "application/pdf": "pdf" }, label: "PDF up to 2 MB" },
  AUTH_LETTER: {
    maxBytes: 2 * 1024 * 1024,
    types: { "application/pdf": "pdf" },
    label: "PDF up to 2 MB",
  },
  LOGO: {
    maxBytes: 1024 * 1024,
    types: { "image/png": "png", "image/jpeg": "jpg" },
    label: "PNG or JPG up to 1 MB",
  },
};

export function uploadRuleLabel(kind: UploadKind) {
  return rules[kind].label;
}

export function isStorageConfigured() {
  return !!process.env.CLOUDINARY_URL;
}

// The declared MIME type can be faked, so check the file's first bytes as well.
function sniffType(bytes: Buffer) {
  if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "image/png";
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  return null;
}

export type StoredFile = {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  publicUrl: string | null;
};

// Validates and uploads a file. Returns an error message instead of throwing for
// anything the user can fix.
export async function storeFile(
  kind: UploadKind,
  file: FormDataEntryValue | null
): Promise<{ file: StoredFile } | { error: string }> {
  const rule = rules[kind];
  // A crafted request can send text where a file is expected.
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > rule.maxBytes) return { error: `The file is too large. Upload a ${rule.label}.` };

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffType(bytes);
  if (!mimeType || !(mimeType in rule.types)) {
    return { error: `Unsupported file. Upload a ${rule.label}.` };
  }
  if (!isStorageConfigured()) {
    return { error: "File storage isn't configured yet. Ask the administrator to set CLOUDINARY_URL." };
  }

  const isImage = kind === "LOGO";
  const extension = rule.types[mimeType];
  let result: UploadApiResponse;
  try {
    result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `placement/${kind.toLowerCase()}`,
            // Raw files keep their extension in the public id.
            public_id: isImage ? createId() : `${createId()}.${extension}`,
            resource_type: isImage ? "image" : "raw",
            type: isImage ? "upload" : "private",
            overwrite: false,
          },
          (error, response) => (error || !response ? reject(error) : resolve(response))
        )
        .end(bytes);
    });
  } catch (error) {
    // Provider problems (bad credentials, missing permissions, outages) aren't the
    // user's to fix, so log the detail and show a plain message instead of crashing.
    console.error("[storage] Upload failed", error);
    return { error: "The upload failed on our side. Please try again later or contact the placement cell." };
  }

  return {
    file: {
      storageKey: result.public_id,
      fileName: file.name.slice(0, 200),
      mimeType,
      size: file.size,
      publicUrl: isImage ? result.secure_url : null,
    },
  };
}

// A download link for a private document, valid for five minutes.
export function signedFileUrl(storageKey: string) {
  return cloudinary.utils.private_download_url(storageKey, "", {
    resource_type: "raw",
    type: "private",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
  });
}

export async function deleteStoredFile(storageKey: string, kind: UploadKind) {
  if (!isStorageConfigured()) return;
  try {
    await cloudinary.uploader.destroy(storageKey, {
      resource_type: kind === "LOGO" ? "image" : "raw",
      type: kind === "LOGO" ? "upload" : "private",
      invalidate: true,
    });
  } catch (error) {
    // A leftover file is harmless; don't fail the user's action over it.
    console.error("[storage] Failed to delete", storageKey, error);
  }
}
