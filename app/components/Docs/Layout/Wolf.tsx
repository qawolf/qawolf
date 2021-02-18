import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { getWolfColors } from "../../../theme/wolf";
import { UserContext } from "../../UserContext";
import WolfLeft from "./icons/WolfLeft";
import WolfRight from "./icons/WolfRight";

const animateMs = 800;
const timeoutMs = 250;
const width = 120;

export default function Wolf(): JSX.Element {
  const { wolf } = useContext(UserContext);

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

  const colors = getWolfColors(wolf?.variant);

  return (
    <Box
      align="center"
      background="gray0"
      flex={false}
      height="139px" // prevent resizing as wolf changes
      justify="end"
    >
      {isLeft ? (
        <WolfLeft colors={colors} width={width} />
      ) : (
        <WolfRight colors={colors} width={width} />
      )}
    </Box>
  );
}
