"use client";

import React from "react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="max-w-md text-center">
        <div className="rounded-lg border border-red-500/20 bg-slate p-8">
          <h2 className="mb-4 font-mono text-xl text-red-500">
            Something went wrong!
          </h2>

          <p className="mb-6 font-mono text-sm text-gray">
            {error.message || "An unexpected error occurred"}
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={reset}
              className="rounded-md border border-yellow-400 bg-black-600 px-6 py-2 font-mono text-sm text-yellow transition-colors hover:border-yellow-400 hover:bg-black-700"
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="rounded-md border border-gray/20 bg-black-600 px-6 py-2 font-mono text-sm text-gray transition-colors hover:border-gray/40 hover:bg-black-700"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
