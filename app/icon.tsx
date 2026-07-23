import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0f172a",
          borderRadius: 7,
          position: "relative",
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 10,
            width: 14,
            height: 2.4,
            borderRadius: 1.2,
            background: "#38bdf8",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 15,
            width: 18,
            height: 2.4,
            borderRadius: 1.2,
            background: "#94a3b8",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 20,
            width: 10,
            height: 2.4,
            borderRadius: 1.2,
            background: "#94a3b8",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 23.9,
            top: 9.6,
            width: 3.2,
            height: 3.2,
            borderRadius: "50%",
            background: "#4ade80",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
