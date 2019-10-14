import { sleep } from "./timer";

export const scrollTo = async (
  yPosition: number,
  timeoutMs: number = 10000
) => {
  const start = Date.now();

  while (window.pageYOffset !== yPosition) {
    if (Date.now() - start > timeoutMs) {
      throw "Could not scroll, timeout exceeded";
    }

    await sleep(100);
    window.scrollTo(0, yPosition);
  }
};
