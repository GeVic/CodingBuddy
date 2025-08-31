import { Inter, Space_Mono } from "next/font/google";

export const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// For backward compatibility
export const monoSpace = spaceMono;
