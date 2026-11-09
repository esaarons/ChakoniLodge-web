import "server-only";
import fs from "node:fs";
import path from "node:path";
import { photoSlots, type PhotoId, type PhotoSlot } from "@/config/photos";

export type Photo = PhotoSlot & { src: string | null };
export type PhotoMap = Record<PhotoId, Photo>;

const PUBLIC_DIR = path.join(process.cwd(), "public");
const BASE = "/images/lodge";
const EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".avif", ".JPG", ".JPEG"];

/** Resuelve qué fotografías existen en disco; las ausentes quedan con `src: null`. */
export function getPhotos(): PhotoMap {
  const entries = photoSlots.map((slot) => {
    const ext = EXTENSIONS.find((e) =>
      fs.existsSync(path.join(PUBLIC_DIR, BASE, slot.file + e)),
    );
    return [slot.id, { ...slot, src: ext ? `${BASE}/${slot.file}${ext}` : null }];
  });
  return Object.fromEntries(entries) as PhotoMap;
}
