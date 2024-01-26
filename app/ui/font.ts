import "@/app/ui/global.css";

import { Inter } from "@next/font/google";
import localFont from "@next/font/local";

export const monoSpace = localFont({
  src: "../../public/fonts/SF-Pro-Display-Medium.otf",
  variable: "--font-ms",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/* export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RWBProvider>
      <div className={cx(inter.variable, monoSpace.variable)}>
        <Component {...pageProps} />
      </div>
    </RWBProvider>
  );
} */
