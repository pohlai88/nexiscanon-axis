import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NexusCanon AXIS";
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
          background: "linear-gradient(to bottom right, #000000, #1a1a1a)",
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
          Enterprise Platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
