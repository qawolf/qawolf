// import { logger } from "@qawolf/logger";
// import { FindElementOptions, ScrollValue } from "@qawolf/types";
// import { QAWolfWeb } from "@qawolf/web";
// import { ElementHandle } from "playwright";
// import { getFindElementOptions } from "../find/getFindElementOptions";

// export const scrollElement = async (
//   elementHandle: ElementHandle,
//   value: ScrollValue,
//   options: FindElementOptions = {}
// ): Promise<void> => {
//   const findOptions = getFindElementOptions(options);

//   logger.verbose(`scrollElement: ${value} ${JSON.stringify(findOptions)}`);

//   await elementHandle.evaluate(
//     (element: Element, value: ScrollValue, timeoutMs: number) => {
//       console.log("qawolf: scroll", element);
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       return qawolf.scroll(element, value, timeoutMs);
//     },
//     value,
//     findOptions.timeoutMs || 0
//   );
// };
