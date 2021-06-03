import { useEffect, useState } from "react";

import { isWindowDefined } from "../lib/detection";
import { Size } from "../lib/types";

export const useWindowSize = (): Size => {
  const [windowSize, setWindowSize] = useState<Size>({
    height: isWindowDefined() ? null : window.innerHeight,
    width: isWindowDefined() ? null : window.innerWidth,
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
