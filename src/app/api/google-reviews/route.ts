import { fetchPlaceReviews, isConfigured } from "@/lib/googleReviews";

export const dynamic = "force-dynamic";

/**
 * Proxy de servidor para las reseñas: la API key nunca llega al navegador.
 * Límite simple por IP para que nadie pueda disparar llamadas facturables en bucle.
 * (En memoria y por instancia: suficiente para un prototipo; en producción, usar el
 * límite del proveedor de hosting o un almacén compartido.)
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, { count: number; start: number }>();

function limited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const headers = { "Cache-Control": "no-store" };

  // Sin GOOGLE_MAPS_API_KEY y GOOGLE_PLACE_ID no se contacta a Google en ningún caso.
  if (!isConfigured()) return Response.json({ status: "unconfigured" }, { headers });

  if (limited(ip)) {
    return Response.json({ status: "error" }, { status: 429, headers });
  }
  return Response.json(await fetchPlaceReviews(), { headers });
}
