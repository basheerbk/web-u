import { ImageResponse } from "next/og";

export const alt = "for nayana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT = "for nayana";

// Falls back to the default font if Google Fonts can't be reached at build time.
async function loadFraunces() {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,300&text=${encodeURIComponent(TEXT)}`
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url);
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fraunces = await loadFraunces();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 40%, #2a1d15 0%, #120c08 70%)",
          color: "#f1e4d1",
        }}
      >
        <svg width="72" height="96" viewBox="0 0 24 32" style={{ transform: "rotate(-24deg)" }}>
          <ellipse cx="12" cy="16" rx="10" ry="14" fill="#8a5c3f" />
          <path
            d="M12 3 C 7.5 10, 16.5 21, 12 29"
            stroke="#2a1a10"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 96,
            fontStyle: "italic",
            fontFamily: fraunces ? "Fraunces" : undefined,
            letterSpacing: -2,
          }}
        >
          {TEXT}
        </div>
        <div style={{ marginTop: 28, width: 80, height: 2, background: "#c79a6b" }} />
      </div>
    ),
    {
      ...size,
      fonts: fraunces
        ? [{ name: "Fraunces", data: fraunces, style: "italic", weight: 300 }]
        : undefined,
    }
  );
}
