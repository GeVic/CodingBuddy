import { Copy, Keyboard, Prompt } from "@/components/shared/icons";

import Balancer from "react-wrap-balancer";
import CarbonAds from "@/components/shared/carbonAds";
import Layout from "@/components/layout";
import Terminal from "@/components/home/terminal";
import { Toaster } from "react-hot-toast";
import classNames from "classnames";
import { useRef } from "react";

export default function Home() {
  const terminalRef = useRef<null | HTMLDivElement>(null);

  const scrollToTerminal = () => {
    if (terminalRef.current !== null) {
      terminalRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl px-5 xl:px-0">
        <div className="mx-auto mb-5 flex max-w-fit translate-y-[-1rem] animate-fade-in items-center justify-center space-x-2 overflow-hidden rounded-full border border-light/20 bg-radial-gradient px-5 py-1 opacity-0">
          <p className="text-sm font-semibold text-gray">
            Fast & Easy CodingBuddy
          </p>
        </div>
        <h1 className="monoSpace translate-y-[-1rem] animate-fade-in bg-gradient-to-br from-light to-stone-300 bg-clip-text text-center font-display text-4xl font-bold text-transparent opacity-0 drop-shadow-sm [--animation-delay:100ms] md:text-7xl md:leading-[5rem]">
          <Balancer>Your best coding buddy!</Balancer>
        </h1>
        <p className="monoSpace mt-6 translate-y-[-1rem] animate-fade-in text-center text-gray opacity-0 [--animation-delay:200ms] md:text-xl">
          <Balancer>
            An AI-driven solution that helps you code quickly. Get started with
            CodingBuddy today and save time.
          </Balancer>
        </p>
        <div className="mx-auto mt-10 flex items-center justify-center space-x-5">
          <button
            className="relative flex max-w-fit translate-y-[-1rem] animate-fade-in items-center justify-center rounded-md border border-amber-700 bg-black-600 px-14 py-3 text-sm opacity-0 transition-colors [--animation-delay:300ms] hover:border-amber-600 hover:bg-black-700"
            onClick={scrollToTerminal}
          >
            <p className="monoSpace bg-gradient-to-r from-yellow to-amber bg-clip-text text-base text-transparent hover:from-yellow-400 hover:to-amber-400">
              Get Started
            </p>
          </button>
        </div>
      </div>

      <div
        className="relative w-full max-w-screen-xl -scroll-mt-10 pt-20 pb-8 xl:w-8/12 xl:-scroll-mt-16 xl:pt-36"
        id="terminal"
        ref={terminalRef}
      >
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{ duration: 1000 }}
        />

        <Terminal />

        <div className="absolute -bottom-44 -left-12 right-0 h-full w-full max-w-screen-xl rounded-[1000px] bg-feature-pattern opacity-10 blur-[160px] xl:h-[278px] xl:w-[748px] xl:opacity-30" />
      </div>

      <div className="my-10 grid w-full max-w-screen-xl animate-[slide-down-fade_0.5s_ease-in-out] grid-cols-1 gap-12 px-5 md:grid-cols-3 xl:w-8/12 xl:gap-12 xl:px-0">
        {steps.map(({ icon, title, description }, index) => (
          <div
            key={title}
            className={classNames(
              "monoSpace mx-auto max-w-md bg-gradient-to-br text-center",
              `translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:${
                index + 1
              }00ms]`,
            )}
          >
            <div className="flex items-center justify-center pb-3">{icon}</div>
            <h2 className="bg-gradient-to-br from-light to-stone-300 bg-clip-text pb-1 font-display text-xl font-bold text-transparent md:font-normal">
              {title}
            </h2>
            <div className="font-base prose-base max-w-xs leading-normal text-gray">
              {description}
            </div>
          </div>
        ))}
      </div>
      {/* <CarbonAds /> */}
    </Layout>
  );
}

const steps = [
  {
    icon: <Keyboard className="h-8 w-8 text-yellow" />,
    title: "Choose the buddy",
    description:
      "Start by choosing the right tool for your need. Prompts is out job. ",
  },
  {
    icon: <Prompt className="h-8 w-8 text-yellow" />,
    title: "Describe the command",
    description:
      "Based on your description, the CodingBuddy will suggest the more relevant answers.",
  },
  {
    icon: <Copy className="h-8 w-8 text-yellow" />,
    title: "Copy",
    description:
      "Now you can copy the solution as per your need. Hassle-free, think-free tool.",
  },
];
