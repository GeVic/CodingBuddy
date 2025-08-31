"use client";

import dynamic from "next/dynamic";
import React, { ReactNode } from "react";

// Dynamically import the providers to avoid SSR issues
const ProvidersComponent = dynamic(
  () =>
    import("react-aria").then((mod) => {
      const { SSRProvider } = mod;
      const { NextUIProvider } = require("@nextui-org/react");

      return {
        default: ({ children }: { children: ReactNode }) => (
          <SSRProvider>
            <NextUIProvider disableBaseline>{children}</NextUIProvider>
          </SSRProvider>
        ),
      };
    }),
  {
    ssr: false, // This ensures it only runs on client
  }
);

interface DynamicProvidersProps {
  children: ReactNode;
}

export function DynamicProviders({ children }: DynamicProvidersProps) {
  return <ProvidersComponent>{children}</ProvidersComponent>;
}
