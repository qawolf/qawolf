import { useEffect, useState } from "react";

import { isServer } from "../lib/detection";

type WindowSize = {
  height: number | null;
  width: number | null;
};

// https://stackoverflow.com/a/63408216
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    height: isServer() ? null : window.innerHeight,
    width: isServer() ? null : window.innerWidth,
  });

  useEffect(() => {
    if (!isServer()) {
      const handleResize = () => {
        setWindowSize({
          height: window.innerHeight,
          width: window.innerWidth,
        });
      };

      window.addEventListener("resize", handleResize, { passive: true });

      // call handler right away so state gets updated with initial window size
      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return windowSize;
};
