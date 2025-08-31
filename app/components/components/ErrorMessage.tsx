import React, { useEffect, useState } from "react";
import { BaseError, getUserFriendlyMessage } from "@/app/types/errors";

interface ErrorMessageProps {
  error: Error | BaseError | null;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function ErrorMessage({
  error,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsLeaving(false);

      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // Match animation duration
  };

  if (!isVisible || !error) return null;

  const message = getUserFriendlyMessage(error);
  const isRetryable = error instanceof BaseError &&
    (error.statusCode >= 500 || error.code === "NETWORK_ERROR" || error.code === "TIMEOUT_ERROR");

  // Determine error type for styling
  const getErrorStyle = () => {
    if (!(error instanceof BaseError)) return "border-red-500/30";

    switch (error.code) {
      case "NETWORK_ERROR":
      case "TIMEOUT_ERROR":
        return "border-orange-300/30";
      case "VALIDATION_ERROR":
        return "border-yellow-400/30";
      default:
        return error.statusCode >= 500 ? "border-red-500/30" : "border-orange-300/30";
    }
  };

  const getErrorIcon = () => {
    if (!(error instanceof BaseError)) return "!";

    switch (error.code) {
      case "NETWORK_ERROR":
        return "⚡";
      case "TIMEOUT_ERROR":
        return "⏱";
      case "VALIDATION_ERROR":
        return "✎";
      default:
        return error.statusCode >= 500 ? "!" : "⚠";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md transform transition-all duration-300 ${
        isLeaving ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div
        className={`flex items-start space-x-3 rounded-lg border bg-zinc/95 p-4 font-mono text-sm shadow-lg backdrop-blur-sm ${getErrorStyle()}`}
      >
        {/* Error Icon */}
        <span className="text-lg leading-none text-gray">{getErrorIcon()}</span>

        {/* Error Content */}
        <div className="flex-1 space-y-1">
          <p className="text-light">{message}</p>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && error instanceof BaseError && (
            <p className="text-xs text-gray">
              [{error.code}] {error.statusCode}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isRetryable && onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-xs text-gray transition-colors hover:text-light"
              title="Retry"
            >
              retry
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-gray transition-colors hover:text-light"
            aria-label="Dismiss error"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Alternative inline error display for terminal output
export function InlineError({ message }: { message: string }) {
  return (
    <div className="mb-2 font-mono text-sm">
      <span className="text-red-500">{">"} Error: </span>
      <span className="text-gray">{message}</span>
    </div>
  );
}

// Terminal-style error output
export function TerminalError({ error }: { error: Error | BaseError }) {
  const message = getUserFriendlyMessage(error);
  const code = error instanceof BaseError ? error.code : "ERROR";

  return (
    <div className="font-mono text-sm">
      <span className="text-red-500">{">"} 🚨 </span>
      <span className="text-gray">{message}</span>
      {process.env.NODE_ENV === "development" && (
        <span className="ml-2 text-xs text-gray/60">[{code}]</span>
      )}
    </div>
  );
}
