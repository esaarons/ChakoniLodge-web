import "server-only";

/**
 * Reseñas del establecimiento desde Google Places API (New), Place Details.
 *
 * - Solo se consulta Google si GOOGLE_MAPS_API_KEY y GOOGLE_PLACE_ID están definidos. Si falta
 *   cualquiera, no se hace ninguna solicitud y la interfaz muestra el enlace a la ficha.
 * - Sin caché: la política de Google solo exime al place_id de las restricciones de almacenamiento,
 *   así que los textos de reseñas no se guardan (fetch con `no-store`).
 * - Todas las URL que devuelve la API se aceptan solo si son https.
 *
 * Orden: Place Details (New) devuelve como mucho cinco reseñas elegidas por Google (por defecto,
 * por relevancia) y no permite pedir las más recientes. Se ordenan por fecha las que llegan.
 */

export type ReviewView = {
  author: string;
  authorUri: string | null;
  authorPhotoUri: string | null;
  rating: number;
  text: string;
  /** Texto original cuando Google ha traducido la reseña; null si no hay traducción. */
  originalText: string | null;
  relativeTime: string;
  publishTime: string | null;
  /** Enlace a la reseña en Google Maps (obligatorio para mostrarla). */
  reviewUri: string;
  /** Enlace de Google para reportar la reseña. */
  flagUri: string | null;
};

export type ReviewsPayload =
  | { status: "unconfigured" }
  | { status: "error" }
  | {
      status: "ok";
      rating: number | null;
      total: number | null;
      mapsUri: string | null;
      attributions: { provider: string; uri: string | null }[];
      reviews: ReviewView[];
    };

type LocalizedText = { text?: string; languageCode?: string };

type PlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  attributions?: { provider?: string; providerUri?: string }[];
  reviews?: {
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: LocalizedText;
    originalText?: LocalizedText;
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
    googleMapsUri?: string;
    flagContentUri?: string;
  }[];
};

const FIELD_MASK = "rating,userRatingCount,googleMapsUri,attributions,reviews";
/** Máximo que se muestra; la API devuelve como mucho cinco, elegidas por Google. */
export const MAX_REVIEWS = 3;

/** Devuelve la URL solo si es https válida; cualquier otro esquema se descarta. */
export function httpsOnly(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    // Las fotos de autor pueden venir sin esquema ("//lh3.googleusercontent.com/…").
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isConfigured() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_PLACE_ID);
}

export async function fetchPlaceReviews(): Promise<ReviewsPayload> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return { status: "unconfigured" };

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=PE`;
    const res = await fetch(url, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error(`[google-reviews] Places API respondió ${res.status}`);
      return { status: "error" };
    }
    const data = (await res.json()) as PlaceResponse;

    const reviews = (data.reviews ?? [])
      .map((r): ReviewView | null => {
        const author = typeof r.authorAttribution?.displayName === "string" ? r.authorAttribution.displayName.trim() : "";
        const text = (typeof r.text?.text === "string" ? r.text.text : r.originalText?.text ?? "").trim();
        const reviewUri = httpsOnly(r.googleMapsUri);
        const rating = typeof r.rating === "number" ? r.rating : 0;
        // Sin autor no hay atribución; sin enlace a Google Maps no se cumple el acceso a la fuente.
        if (!author || !text || !reviewUri || rating <= 0) return null;

        const original = r.originalText?.text?.trim() ?? "";
        const translated =
          Boolean(original) &&
          Boolean(r.text?.languageCode) &&
          Boolean(r.originalText?.languageCode) &&
          r.text!.languageCode !== r.originalText!.languageCode;

        return {
          author,
          authorUri: httpsOnly(r.authorAttribution?.uri),
          authorPhotoUri: httpsOnly(r.authorAttribution?.photoUri),
          rating,
          text,
          originalText: translated ? original : null,
          relativeTime: typeof r.relativePublishTimeDescription === "string" ? r.relativePublishTimeDescription : "",
          publishTime: typeof r.publishTime === "string" ? r.publishTime : null,
          reviewUri,
          flagUri: httpsOnly(r.flagContentUri),
        };
      })
      .filter((r): r is ReviewView => r !== null)
      // Las más recientes primero (dentro de las que devuelve Google).
      .sort((a, b) => (b.publishTime ?? "").localeCompare(a.publishTime ?? ""))
      .slice(0, MAX_REVIEWS);

    return {
      status: "ok",
      rating: typeof data.rating === "number" ? data.rating : null,
      total: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      mapsUri: httpsOnly(data.googleMapsUri),
      attributions: (data.attributions ?? [])
        .filter((a) => typeof a.provider === "string" && a.provider)
        .map((a) => ({ provider: a.provider!, uri: httpsOnly(a.providerUri) })),
      reviews,
    };
  } catch (error) {
    console.error("[google-reviews] Error al consultar Places API:", error instanceof Error ? error.name : "desconocido");
    return { status: "error" };
  }
}
