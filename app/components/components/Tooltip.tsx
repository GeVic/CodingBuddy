import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode, useState } from "react";
import useWindowSize from "@/app/hooks/use-window-size";
import Leaflet from "./Leaflet";

export default function Tooltip({
  children,
  content,
  fullWidth,
}: {
  children: ReactNode;
  content: ReactNode | string;
  fullWidth?: boolean;
}) {
  const [openTooltip, setOpenTooltip] = useState(false);

  const { isMobile, isDesktop } = useWindowSize();

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className={`${fullWidth ? "w-full" : "inline-flex"} sm:hidden`}
          onClick={() => setOpenTooltip(true)}
        >
          {children}
        </button>
      )}
      {openTooltip && isMobile && (
        <Leaflet setShow={setOpenTooltip}>
          {typeof content === "string" ? (
            <span className="text-gray-700 flex min-h-[150px] w-full items-center justify-center bg-white px-10 text-center text-sm">
              {content}
            </span>
          ) : (
            content
          )}
        </Leaflet>
      )}
      {isDesktop && (
        <TooltipPrimitive.Provider delayDuration={100}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger className="hidden sm:inline-flex" asChild>
              {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content
              sideOffset={4}
              side="top"
              className="animate-slide-up-fade border-gray-200 z-30 hidden items-center overflow-hidden rounded-md border bg-white drop-shadow-lg sm:block"
            >
              <TooltipPrimitive.Arrow className="fill-current text-white" />
              {typeof content === "string" ? (
                <div className="p-5">
                  <span className="text-gray-700 block max-w-xs text-center text-sm">
                    {content}
                  </span>
                </div>
              ) : (
                content
              )}
              <TooltipPrimitive.Arrow className="fill-current text-white" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </>
  );
}
