/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#17181d",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: -5,
            borderRadius: "1000px",
            opacity: 0.3,
            filter: "blur(160px)",
            background:
              "linear-gradient(91.57deg, rgba(250, 190, 101, 0.7) -15.63%, rgba(190, 127, 107, 0.7) 35.95%, rgba(131, 155, 251, 0.7) 108.52%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundImage: "url(https://www.codingbuddy.com/bg-pattern.svg)",
            height: "100%",
            width: "100%",
            zIndex: -2,
            opacity: 0.6,
          }}
        />
        <img
          src={new URL(
            "../../public/logo-white.png",
            import.meta.url,
          ).toString()}
          alt="CodingBuddy Logo"
          tw="mb-4 opacity-95"
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
