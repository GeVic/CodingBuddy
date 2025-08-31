import React from "react";

import { useEffect, useMemo, useRef, useState } from "react";

import { toast } from "react-hot-toast";
import { Copy } from "@/app/components/icons";
import { MenuItem } from "@/app/types";
import { structurePayload } from "@/app/utils";
import { api, apiWithRetry } from "@/app/lib/api";

import { BaseError, ValidationError } from "@/app/types/errors";
import { TerminalError } from "@/app/components/components/ErrorMessage";
import { ErrorHandler } from "@/app/utils/errorHandler";

interface Response {
  type: string;
  content: string;
  id: string;
}

const responseType = {
  answer: "answer",
  question: "question",
};

function removeMarkdown(text: string) {
  text = text.replace(/`(.+?)`/g, "");

  return text;
}

export default function Terminal() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [popular, setPopular] = useState<string>("");
  const [textLength, setTextLength] = useState(0);
  const [error, setError] = useState<BaseError | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [activeConnections, setActiveConnections] = useState<number | null>(null);
  const menuItems: MenuItem[] = [
    { key: "git", name: "Git" },
    { key: "format", name: "Format" },
    { key: "types", name: "Types" },
    { key: "linux", name: "Linux" },
    { key: "macos", name: "macOS" },
    { key: "window", name: "Windows" },
    { key: "names", name: "Naming" },
  ];
  const [selected, setSelected] = useState<string>(menuItems[0].key);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedValue = useMemo(
    () => menuItems.find(item => item.key === selected)?.name || menuItems[0].name,
    [selected],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setInputFocus();
  }, []);

  useEffect(() => {
    if (popular && popular.length > 0) {
      setTextLength(popular.length);
    }
  }, [popular]);

  useEffect(() => {
    const unsubscribe = api.subscribeToLatestQuestion({
      onQuestion: (data) => {
        setPopular(data.value);
      },
      onConnect: () => {
        setSseConnected(true);
        console.log("Connected to live questions stream");
      },
      onError: (error) => {
        setSseConnected(false);
        console.error("SSE connection error:", error);
      }
    });

    return unsubscribe;
  }, []);

  // Fetch active connections count
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await api.getActiveConnection();
        if (data && typeof data.activeConnections === 'number') {
          setActiveConnections(data.activeConnections);
        }
      } catch (error) {
        console.error("Failed to fetch active connections:", error);
      }
    };

    // Initial fetch
    fetchConnections();

    // Poll every 30 seconds
    const interval = setInterval(fetchConnections, 30000);

    return () => clearInterval(interval);
  }, []);

  const setInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const generateCommand = async () => {
    const currentSelectedValue = selected;

    // Clear any previous errors
    setError(null);

    // Validate input
    if (!input.trim()) {
      const validationError = new ValidationError("Please enter a command description");
      setError(validationError);
      return;
    }

    setLoading(true);
    setResponses((prev) => {
      return [
        ...prev,
        {
          type: responseType.question,
          content: "\n" + input,
          id: currentSelectedValue,
        },
      ];
    });

    const userInput = input;
    setInput("");

    const payload = structurePayload(userInput, currentSelectedValue);

    // Check for validation messages from structurePayload
    if (payload.startsWith("💬") || payload.startsWith("🚨")) {
      setResponses((prev) => {
        return [
          ...prev,
          {
            type: responseType.answer,
            content: payload,
            id: currentSelectedValue,
          },
        ];
      });
      setLoading(false);
      setTimeout(() => setInputFocus(), 100);
      return;
    }

    let data: any = null;
    try {
      data = await api.generateCommand({
        content: payload,
        key: currentSelectedValue,
        question: userInput,
      });
    } catch (error) {
      const normalizedError = ErrorHandler.normalizeError(error);
      setError(normalizedError);

      // Add error to responses for terminal display
      setResponses((prev) => {
        return [
          ...prev,
          {
            type: responseType.answer,
            content: `error:${normalizedError.message}`,
            id: currentSelectedValue,
          },
        ];
      });

      setLoading(false);
      setTimeout(() => setInputFocus(), 100);
      return;
    }

    if (!data || !data.answer) {
      const emptyResponseError = new BaseError(
        "No response generated. Please try again.",
        500,
        "EMPTY_RESPONSE"
      );
      setError(emptyResponseError);

      setResponses((prev) => {
        return [
          ...prev,
          {
            type: responseType.answer,
            content: `error:${emptyResponseError.message}`,
            id: currentSelectedValue,
          },
        ];
      });

      setLoading(false);
      setTimeout(() => setInputFocus(), 100);
      return;
    }

    // trying to post to our backend
    /* try {
      await api.postQuery(
        currentSelectedValue,
        removeMarkdown(data.answer).toLowerCase()
      );
    } catch (error) {
      console.log(`Error: ${error}`);
    } */

    setResponses((prev) => {
      return [
        ...prev,
        {
          type: responseType.answer,
          content: removeMarkdown(data.answer),
          id: currentSelectedValue,
        },
      ];
    });

    setLoading(false);
    setTimeout(() => {
      setInputFocus();

      if (typeof (window as any)._carbonads !== "undefined") {
        (window as any)._carbonads.refresh();
      }
    }, 100);
  };

  const typingStyle = {
    borderRight: "2px solid violet",
    WhiteSpace: "pre-wrap",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "1.4em",
    fontFamily: "monospace",
    overflow: "hidden",
    clipPath: "inset(0 100% 0 0)",
    animation: `typing 4s steps(${textLength}) infinite`,
  };

  return (
    <div className="relative z-10 mx-5 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] xl:mx-0">
      {sseConnected && popular && popular.length > 0 && (
        <>
          <div
            className="mb-4 overflow-hidden rounded-lg border border-green-900/30 bg-black/40 p-4 font-mono backdrop-blur-sm"
            style={{
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            }}
          >
            {/* Terminal-style header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-500">▶</span>
                <span className="text-sm text-green-500/80">peers are searching...</span>
              </div>
              {activeConnections !== null && (
                <div className="inline-flex items-center gap-1.5 align-middle">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
                  <span className="text-xs text-green-500/60 leading-none">{activeConnections} online</span>
                </div>
              )}
            </div>

            {/* Popular text */}
            <div className="relative pl-4">
              <div
                className="text-base text-light"
                style={{
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {popular}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="relative z-10 m-auto w-full overflow-hidden rounded-lg border border-light/5 font-mono leading-normal subpixel-antialiased shadow-3xl xl:px-0">
        <div className="relative flex h-6 w-full items-center justify-center space-x-2 border-b border-slate bg-slate p-4">
          <div className="group absolute left-3 flex flex-1 space-x-2 justify-self-start">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="ml-2 h-3 w-3 rounded-full bg-orange-300"></div>
            <div className="ml-2 h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div className="group absolute right-3 flex" ref={dropdownRef}>
            <button
              className="flex items-center space-x-1 rounded px-2 py-1 font-mono text-sm text-gray transition-colors hover:bg-zinc/50 hover:text-light"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{selectedValue}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-[120px] rounded border border-zinc/20 bg-zinc py-1 shadow-lg">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    className={`block w-full px-3 py-1.5 text-left font-mono text-sm transition-colors ${
                      selected === item.key
                        ? 'bg-black-400 text-light'
                        : 'text-gray hover:bg-black-400 hover:text-light'
                    }`}
                    onClick={() => {
                      setSelected(item.key);
                      setDropdownOpen(false);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex h-96 flex-col space-y-2 overflow-y-auto bg-zinc p-3 pb-16 font-mono text-base text-light">
          {responses.map((item, index) => {
            return (
              <div key={index}>
                {item.type === responseType.question && (
                  <div>
                    <span className="text-gray">{"> "}</span>
                    {item.content}
                  </div>
                )}

                {loading && index === responses.length - 1 ? (
                  <span className="inline-block w-2 overflow-hidden align-middle font-mono">
                    <span className="flex w-16 animate-tiles flex-nowrap font-mono text-gray">
                      <span className="w-4">\</span>
                      <span className="w-4">|</span>
                      <span className="w-4">/</span>
                      <span className="w-4">-</span>
                    </span>
                  </span>
                ) : item.type === responseType.answer && item.content.startsWith("error:") ? (
                  <TerminalError
                    error={new BaseError(
                      item.content.replace("error:", ""),
                      500,
                      "COMMAND_ERROR"
                    )}
                  />
                ) : item.type === responseType.answer ? (
                  <div className="inline-block">
                    {item.id === "format" || item.id === "types" ? (
                      <pre className="monoSpace mb-2 border border-gray bg-black p-3 text-gray">
                        {item.content.length > 0 &&
                          !item.content.includes("💬") &&
                          !item.content.includes("🚨") && (
                            <button
                              className="ml-2 flex items-center rounded-md bg-slate px-2 py-2 transition-all duration-75 ease-in hover:bg-black-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                                toast("Git command copied to clipboard.", {
                                  icon: (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 stroke-2 text-[#4db682]"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                      <path d="m9 12 2 2 4-4"></path>
                                    </svg>
                                  ),
                                  style: {
                                    height: 38,
                                    borderRadius: 4,
                                    border: "1px solid #515151",
                                    padding: "16px 12px",
                                    color: "#fffef1",
                                    background: "#343333",
                                    fontSize: 12,
                                    letterSpacing: "0.3px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyItems: "center",
                                    margin: 0,
                                  },
                                });
                              }}
                            >
                              <Copy className="h-4 w-4 stroke-2 text-light" />
                              <span className="font-mono"> copy</span>
                            </button>
                          )}
                        <br />
                        {item.content}
                      </pre>
                    ) : (
                      <>
                        <span className="font-mono text-gray">{"> "}</span>
                        {item.content}
                        {item.content.length > 0 &&
                          !item.content.includes("💬") &&
                          !item.content.includes("🚨") &&
                          !item.content.startsWith("error:") && (
                            <button
                              className="ml-2 rounded-md bg-slate px-2 py-2 transition-all duration-75 ease-in hover:bg-black-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                                toast("Git command copied to clipboard.", {
                                  icon: (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 stroke-2 text-[#4db682]"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                      <path d="m9 12 2 2 4-4"></path>
                                    </svg>
                                  ),
                                  style: {
                                    height: 38,
                                    borderRadius: 4,
                                    border: "1px solid #515151",
                                    padding: "16px 12px",
                                    color: "#fffef1",
                                    background: "#343333",
                                    fontSize: 12,
                                    letterSpacing: "0.3px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyItems: "center",
                                    margin: 0,
                                  },
                                });
                              }}
                            >
                              <Copy className="h-4 w-4 stroke-2 text-light" />
                            </button>
                          )}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}

          {!loading && (
            <div className="flex flex-row items-center ">
              <div className="text-gray">{">"}</div>
              <form
                action="submit"
                onSubmit={(e) => {
                  e.preventDefault();
                  generateCommand();
                }}
                className="w-full"
              >
                <input
                  ref={inputRef}
                  className="w-full bg-transparent pl-2.5 font-mono border-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
                  value={input}
                  placeholder={
                    responses.length < 1
                      ? "Type what you need from your buddy..."
                      : undefined
                  }
                  onChange={(e) => setInput(e.target.value)}
                />
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full bg-terminal-pattern opacity-20 blur-3xl" />
    </div>
  );
}
