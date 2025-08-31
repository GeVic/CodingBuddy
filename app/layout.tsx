"use client";

import React from "react";
import "./styles/global.css";
import BaseLayout from "./components/layouts/BaseLayout";
import { DynamicProviders } from "./components/layouts/DynamicProviders";
import { inter, spaceMono } from "./utils/fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <head>
        <title>CodingBuddy - The best geeky bud you can find!</title>
        <meta
          name="description"
          content="CodingBuddy is AI-driven solution that helps you code quickly. Get started with CodingBuddy today and save time."
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-black antialiased`}
        style={{ backgroundColor: "#000000" }}
      >
        <DynamicProviders>
          <BaseLayout>{children}</BaseLayout>
        </DynamicProviders>
      </body>
    </html>
  );
}
