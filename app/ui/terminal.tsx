import { useEffect, useMemo, useRef, useState } from "react";

import { Dropdown } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Copy } from "@/app/ui/components/shared/icons";
import { MenuItem } from "../lib/definition";
import { structurePayload } from "../lib/utils";
import styles from "@/app/ui/home.module.css";

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuItems: MenuItem[] = [
    { key: "git", name: "Git" },
    { key: "funny", name: "Funny" },
    { key: "format", name: "Format" },
    { key: "types", name: "Types" },
    { key: "linux", name: "Linux" },
    { key: "macos", name: "macOS" },
    { key: "window", name: "Windows" },
    { key: "names", name: "Naming" },
  ];
  const [selected, setSelected] = useState<any>(new Set([menuItems[0].name]));

  const selectedValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected],
  );

  useEffect(() => {
    setInputFocus();
  }, []);

  useEffect(() => {
    if (popular && popular.length > 0) {
      setTextLength(popular.length);
    }
  }, [popular]);

  useEffect(() => {
    const interval = setInterval(async () => {
      // calling read api from backend every 30s
      try {
        const response = await fetch(`https://codingbuddy.azurewebsites.net/query`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setPopular(data.key);
        console.log(`Set is complete`, data.key);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }, 6000); // 60s interval

    if (interval) {
      return () => clearInterval(interval);
    }
  }, []);

  const setInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const generateCommand = async () => {
    const currentSelectedValue = selectedValue;
    setLoading(true);
    setResponses((prev) => {
      return [
        ...prev,
        {
          type: responseType.question,
          content: "\n" + input,
          id: currentSelectedValue.toLowerCase(),
        },
      ];
    });
    setInput("");

    const payload = structurePayload(input, currentSelectedValue.toLowerCase());

    let response: any = null;
    try {
      response = await fetch("https://codingbuddy.azurewebsites.net/query/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: payload,
          key: currentSelectedValue.toLowerCase(),
          question: input,
        }),
      });
      console.log({ response });
    } catch (error) {
      console.log(`Error: ${error}`);
    }

    const data = await response.json();

    if (!data) {
      return;
    }

    // trying to post to our backend
    /* try {
      const response = await fetch("http://localhost:3005/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: (latestValue as string).toLowerCase(),
          value: removeMarkdown(resultData).toLowerCase(),
        }),
      });
    } catch (error) {
      console.log(`Error: ${error}`);
    } */

    setResponses((prev) => {
      return [
        ...prev,
        {
          type: responseType.answer,
          content: removeMarkdown(data.answer),
          id: currentSelectedValue.toLowerCase(),
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
      {popular && popular.length > 0 && (
        <>
          <div
            style={{
              display: "inline-block",
              borderLeft: "10px solid rgba(128, 128, 128, 0.4)",
              paddingLeft: "1em",
              marginBottom: "1em",
              animation: "blink-cursor 1s step-end infinite",
            }}
          >
            <p className="monoSpace bg-gradient-to-r from-yellow to-yellow-400 bg-clip-text text-2xl text-base text-transparent">
              your peers are searching...
            </p>
            <div style={typingStyle}>{popular}</div>
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
          <div className="group absolute right-3 flex">
            <Dropdown disableAnimation>
              <Dropdown.Button
                flat
                color="default"
                css={{
                  tt: "capitalize",
                  color: "gray",
                  background: "#17181D00",
                  maxHeight: 30,
                }}
              >
                {selectedValue}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Dynamic Actions"
                items={menuItems}
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selected}
                onSelectionChange={setSelected}
                css={{
                  background: "slate",
                }}
              >
                {(item: any) => (
                  <Dropdown.Item
                    key={item.key}
                    color={"default"}
                    css={{
                      color: "gray",
                      fontFamily: "$mono",
                    }}
                    className="hover:bg-black-400 focus:bg-black-400 focus:text-white"
                  >
                    {item.name}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
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
                              <span className="monoSpace"> copy</span>
                            </button>
                          )}
                        <br />
                        {item.content}
                      </pre>
                    ) : (
                      <>
                        <span className="monoSpace text-gray">{"> "}</span>
                        {item.content}
                        {item.content.length > 0 &&
                          !item.content.includes("💬") &&
                          !item.content.includes("🚨") && (
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
                  className="monoSpace w-full bg-transparent pl-2.5 focus:outline-none focus:ring-0 focus:ring-offset-0"
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
