import { useEffect, useState, useRef } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

const useBreakpointChange = (
  callback: (newBreakpoint: Breakpoint) => void,
  triggerOnAllResizes = false,
  debounceTime = 300
): Breakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("sm");
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      let newBreakpoint: Breakpoint | null = null;

      for (const [key, value] of Object.entries(breakpoints)) {
        if (currentWidth < value) {
          newBreakpoint = key as Breakpoint;
          break;
        }
      }

      if (newBreakpoint && currentBreakpoint !== newBreakpoint) {
        setCurrentBreakpoint(newBreakpoint);
        if (!triggerOnAllResizes && initialized.current) {
          callback(newBreakpoint);
        }
      }

      if (triggerOnAllResizes && initialized.current) {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
          callback(currentBreakpoint);
        }, debounceTime);
      }
    };

    if (!initialized.current) {
      handleResize(); // Set initial breakpoint
      initialized.current = true;
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [callback, triggerOnAllResizes, debounceTime, currentBreakpoint]);

  return currentBreakpoint;
};

export default useBreakpointChange;
