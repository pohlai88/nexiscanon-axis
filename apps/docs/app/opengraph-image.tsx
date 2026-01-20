import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NexusCanon AXIS Documentation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom, #0f172a, #1e293b)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "white",
        }}
      >
        <div style={{ fontWeight: 700 }}>NexusCanon AXIS</div>
        <div style={{ fontSize: 48, marginTop: 20, opacity: 0.8 }}>
          Design System Documentation
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
