import { useEffect, useState } from "react";

import { isServer } from "../lib/detection";

type WindowSize = {
  height: number | null;
  width: number | null;
};

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    height: isServer() ? null : window.innerHeight,
    width: isServer() ? null : window.innerWidth,
  });

  useEffect(() => {
    const setSize = () => {
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", setSize, { passive: true });

    // call handler right away so state gets updated with initial window size
    setSize();

    return () => window.removeEventListener("resize", setSize);
  }, []);

  return windowSize;
};
