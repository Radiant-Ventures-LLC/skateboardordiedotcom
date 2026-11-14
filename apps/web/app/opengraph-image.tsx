import { ImageResponse } from "next/og";
import { voice } from "skateaf";

// Share card for IG / Discord / iMessage link previews. Rendered once at build
// time (no request data), so it ships as a static PNG.
export const alt = `skateboardordie.com — ${voice.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori needs TTF/OTF, not woff2. An old UA makes Google Fonts serve TTF.
async function font(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error(`no TTF for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

// skateAF palette (kept literal here: Satori can't read CSS variables).
const FLAG = "#E01B1B";
const GOLD = "#F2C230";
const PAPER = "#F4EFE3";
const VOID = "#0B0B0B";

export default async function OgImage() {
  const [poster, mono] = await Promise.all([
    font("Archivo Black", 400),
    font("Space Mono", 700),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          borderTop: `28px solid ${FLAG}`,
          borderBottom: `28px solid ${VOID}`,
          padding: "56px 72px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              background: GOLD,
              color: VOID,
              border: `4px solid ${VOID}`,
              boxShadow: `6px 6px 0 ${VOID}`,
              padding: "8px 20px",
              fontFamily: "Space Mono",
              fontSize: 28,
              textTransform: "uppercase",
              transform: "rotate(-3deg)",
            }}
          >
            {voice.welcome.kicker}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Archivo Black",
            fontSize: 86,
            lineHeight: 0.95,
            color: VOID,
            textTransform: "uppercase",
            borderLeft: `14px solid ${FLAG}`,
            paddingLeft: 28,
          }}
        >
          <span>Just another day</span>
          <span>
            in <span style={{ color: FLAG, marginLeft: 24 }}>Paradise.</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Space Mono",
            fontSize: 30,
            color: VOID,
            textTransform: "uppercase",
          }}
        >
          <span>
            skateboard<span style={{ color: FLAG }}>ordie</span>.com
          </span>
          <span>{voice.creed}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo Black", data: poster, weight: 400 },
        { name: "Space Mono", data: mono, weight: 700 },
      ],
    },
  );
}
