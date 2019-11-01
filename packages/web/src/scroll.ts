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

  console.log("scroll to", value, element);

  while (element.scrollLeft !== value.x || element.scrollTop !== value.y) {
    if (Date.now() - start > timeoutMs) {
      console.log("scroll timeout exceeded", {
        x: element.scrollLeft,
        y: element.scrollTop
      });

      if (
        element.scrollLeft === startScroll.x &&
        element.scrollTop === startScroll.y
      ) {
        throw new Error("could not scroll");
      }

      return;
    }

    await sleep(100);
    element.scroll(value.x, value.y);
  }

  console.log("scroll succeeeded", {
    x: element.scrollLeft,
    y: element.scrollTop
  });
};
