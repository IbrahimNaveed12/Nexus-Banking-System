"use client";

import { useState, useEffect } from "react";

/**
 * Responsive viewport detection hook for WebGL & layout performance throttling.
 * Returns true if viewport width is under breakpoint (default: 768px).
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
