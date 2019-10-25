import { ScrollValue } from "@qawolf/types";
import { sleep } from "./timer";

export const scroll = async (
  element: Element,
  value: ScrollValue,
  timeoutMs: number = 10000
) => {
  const start = Date.now();
  console.log("scroll", element, "to", value);

  while (element.scrollLeft !== value.x || element.scrollTop !== value.y) {
    if (Date.now() - start > timeoutMs) {
      throw "Could not scroll, timeout exceeded";
    }

    await sleep(100);
    element.scroll(value.x, value.y);
  }
};
