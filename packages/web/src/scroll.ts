import { ScrollValue } from "@qawolf/types";
import { sleep } from "./wait";

export const scroll = async (
  element: Element,
  value: ScrollValue,
  timeoutMs: number = 10000
) => {
  const start = Date.now();
  const startScroll = {
    x: element.scrollLeft,
    y: element.scrollTop
  };

  console.debug("qawolf: scroll to", value, element);

  const isScrolled = () =>
    element.scrollLeft === value.x && element.scrollTop === value.y;

  do {
    element.scroll(value.x, value.y);
    await sleep(100);
  } while (!isScrolled() && Date.now() - start < timeoutMs);

  if (isScrolled()) {
    console.debug("qawolf: scroll succeeeded");
    return;
  }

  console.debug("qawolf: scroll timeout exceeded", {
    x: element.scrollLeft,
    y: element.scrollTop
  });

  // only throw an error if it could not scroll at all
  if (
    element.scrollLeft === startScroll.x &&
    element.scrollTop === startScroll.y
  ) {
    throw new Error("could not scroll");
  }
};
