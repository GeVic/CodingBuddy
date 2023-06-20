import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import GoogleAnalytics from "@/components/shared/googleAnalytics";
import { Inter } from "@next/font/google";
import { Provider as RWBProvider } from "react-wrap-balancer";
import cx from "classnames";
import localFont from "@next/font/local";

const sfPro = localFont({
  src: "../styles/SF-Pro-Display-Medium.otf",
  variable: "--font-sf",
});

const monoSpace = localFont({
  src: "../styles/SpaceMono-Regular.ttf",
  variable: "--font-ms",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <RWBProvider>
        <div className={cx(sfPro.variable, inter.variable, monoSpace.variable)}>
          <Component {...pageProps} />
        </div>
      </RWBProvider>
      <Analytics />
      <GoogleAnalytics />
    </>
  );
}
