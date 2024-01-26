"use client";

import Base from "./ui/base";
import { inter } from "./ui/font";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Base children={children} />
      </body>
    </html>
  );
}
