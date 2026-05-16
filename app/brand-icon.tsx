import { ImageResponse } from "next/og";

const ACCENT = "#171717";

/** WedStudio OS mark — matches `.brand-mark` in the app shell. */
export function createBrandIcon(pixelSize: number) {
  const radius = Math.round(pixelSize * (6 / 32));
  const fontSize = Math.max(10, Math.round(pixelSize * (11 / 32)));
  const letterSpacing = pixelSize >= 64 ? 1.2 : 0.5;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
          borderRadius: radius,
          color: "#ffffff",
          fontSize,
          fontWeight: 700,
          letterSpacing,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        WS
      </div>
    ),
    {
      width: pixelSize,
      height: pixelSize,
    },
  );
}
