import { useEffect, useState } from "react";

import { isWindowDefined } from "../lib/detection";
import { Size } from "../lib/types";

export const useWindowSize = (): Size => {
  const [windowSize, setWindowSize] = useState<Size>({
    height: isWindowDefined() ? window.innerHeight : null,
    width: isWindowDefined() ? window.innerWidth : null,
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
