"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Github } from "@/app/components/icons";
import Link from "next/link";
import Meta from "./Meta";

export default function BaseLayout({
  meta,
  children,
}: {
  meta?: {
    title?: string;
    description?: string;
    image?: string;
  };
  children: ReactNode;
}) {
  const [terminalRef, setTerminalRef] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (document) {
      setTerminalRef(document.getElementById("terminal"));
    }
  }, []);

  const scrollToTerminal = () => {
    if (terminalRef !== null) {
      terminalRef.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Meta {...meta} />

      <div
        className="min-h-screen w-full antialiased"
        style={{
          backgroundColor: "#000000",
          backgroundImage: 'url("/bg-pattern.svg")',
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        <header className="w-full">
          <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
            <Link
              href="/"
              className="relative flex items-center font-display text-2xl"
            >
              <p className="font-mono font-bold text-white">CodingBuddy</p>
            </Link>
          </div>
        </header>

        <main className="flex w-full flex-col items-center justify-center pt-20">
          {children}
        </main>

        <div className="h-40 w-full bg-gradient-to-t from-slate to-transparent" />
      </div>

      <footer className="w-full bg-black py-10 text-gray">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-col items-center text-sm md:flex-row md:justify-between">
            <p className="order-2 mt-3 space-y-4 font-mono text-sm md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} CodingBuddy
            </p>

            <ul className="order-1 flex flex-wrap items-center text-sm md:order-2">
              <li>
                <Link href="/privacy" className="mr-4 hover:underline md:mr-6">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  className="text-gray transition-all duration-75 hover:opacity-90"
                  href="https://github.com/GeVic"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-7 w-7" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
