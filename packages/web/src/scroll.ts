import { ScrollValue } from "@qawolf/types";
import { sleep } from "./wait";

export const scroll = async (
  element: Element,
  value: ScrollValue,
  timeoutMs: number = 10000
) => {
  const start = Date.now();
  console.log("scroll to", value, element);

  while (element.scrollLeft !== value.x || element.scrollTop !== value.y) {
    console.log("current scroll", {
      x: element.scrollLeft,
      y: element.scrollTop
    });
    if (Date.now() - start > timeoutMs) {
      throw "Could not scroll, timeout exceeded";
    }

    await sleep(100);
    element.scroll(value.x, value.y);
  }
};
