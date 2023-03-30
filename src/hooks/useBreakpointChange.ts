import { useEffect, useState } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

const useBreakpointChange = (
  callback: (newBreakpoint: Breakpoint) => void
): Breakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("sm");

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;

      for (const [key, value] of Object.entries(breakpoints)) {
        if (currentWidth < value) {
          const newBreakpoint = key as Breakpoint;
          if (currentBreakpoint !== newBreakpoint) {
            setCurrentBreakpoint(newBreakpoint);
            callback(newBreakpoint);
          }
          break;
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [callback, currentBreakpoint]);

  return currentBreakpoint;
};

export default useBreakpointChange;
