import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Copy } from "@/components/shared/icons";
import { Dropdown } from "@nextui-org/react";
import { MenuItem } from "utils/OpenAIStream";
import classNames from "classnames";
import { toast } from "react-hot-toast";

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
  const [selected, setSelected] = useState(new Set([menuItems[0].name]));

  const selectedValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected],
  );

  useEffect(() => {
    setInputFocus();
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

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        selected: currentSelectedValue.toLowerCase(),
      }),
    });

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let resultData = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      resultData += chunkValue;
    }

    setResponses((prev) => {
      return [
        ...prev,
        {
          type: responseType.answer,
          content: removeMarkdown(resultData),
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
    }, 250);
  };

  return (
    <div className="relative z-10 mx-5 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] xl:mx-0">
      <div
        className={classNames(
          "relative z-10 m-auto w-full overflow-hidden rounded-lg border border-light/5 font-mono leading-normal subpixel-antialiased shadow-3xl xl:px-0",
        )}
      >
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
                    responses.length < 1 ? "Type what you need..." : undefined
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
