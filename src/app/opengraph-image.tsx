import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { getPhotos } from "@/lib/photos";

export const alt = `${site.name} · Refugio natural en Pucallpa`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Usa la foto del hero si existe; si no, una composición tipográfica. */
export default function OpengraphImage() {
  const hero = getPhotos().exterior.src;
  const background = hero
    ? `data:image/jpeg;base64,${fs.readFileSync(path.join(process.cwd(), "public", hero)).toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#203A2C",
          color: "#F5F1E8",
          fontFamily: "serif",
        }}
      >
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
            backgroundImage: "linear-gradient(to bottom, rgba(24,44,33,0.45) 0%, rgba(24,44,33,0) 35%, rgba(24,44,33,0.15) 55%, rgba(24,44,33,0.85) 100%)", // taste-skill-ignore: velo neutro bajo texto sobre foto
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 8, fontFamily: "sans-serif" }}>{site.wordmark}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, lineHeight: 1.05 }}>Tu refugio natural</div>
            <div style={{ fontSize: 76, lineHeight: 1.05 }}>en Pucallpa</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
