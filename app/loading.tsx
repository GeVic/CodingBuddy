"use client";

import React from "react";
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-lg border border-light/5 bg-slate p-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
          <div className="bg-yellow-500 h-3 w-3 animate-pulse rounded-full"></div>
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
        </div>

        <div className="mt-4 font-mono text-gray">
          <span className="text-yellow">$</span>
          <span className="ml-2">loading</span>
          <span className="ml-1 inline-block animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
