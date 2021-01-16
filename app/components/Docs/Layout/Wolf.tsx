import { Box } from "grommet";
import { useEffect, useState } from "react";

import WolfLeft from "./icons/WolfLeft";
import WolfRight from "./icons/WolfRight";

const animateMs = 800;
const timeoutMs = 250;
const width = 160;

export default function Wolf(): JSX.Element {
  const [isLeft, setIsLeft] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const onScroll = () => {
      setIsScrolling(true);

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, timeoutMs);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScrolling) {
      // check document ready state because scroll event can fire as page loads
      if (document.readyState === "complete") {
        setIsLeft((prev) => !prev);
      }

      interval = setInterval(() => {
        setIsLeft((prev) => !prev);
      }, animateMs);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScrolling]);

  return (
    <Box align="center" flex={false}>
      {isLeft ? <WolfLeft width={width} /> : <WolfRight width={width} />}
    </Box>
  );
}
