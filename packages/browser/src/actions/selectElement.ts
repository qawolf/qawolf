// import { logger } from "@qawolf/logger";
// import { FindElementOptions } from "@qawolf/types";
// import { QAWolfWeb } from "@qawolf/web";
// import { ElementHandle } from "playwright";
// import { getFindElementOptions } from "../find/getFindElementOptions";

// export const selectElement = async (
//   elementHandle: ElementHandle,
//   value: string | null,
//   options: FindElementOptions = {}
// ): Promise<void> => {
//   const findOptions = getFindElementOptions(options);

//   logger.verbose(
//     `selectElement: waitForOption ${value} ${JSON.stringify(findOptions)}`
//   );

//   // ensure option with desired value is loaded before selecting
//   await elementHandle.evaluate(
//     (element: HTMLSelectElement, value: string | null, timeoutMs: number) => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;

//       return qawolf.select
//         .waitForOption(element, value, timeoutMs)
//         .then(() => {
//           console.log(`qawolf: select ${value} from`, element);
//         })
//         .catch(e => {
//           console.log(`qawolf: could not find option ${value}`, element);
//           throw e;
//         });
//     },
//     value,
//     findOptions.timeoutMs || 0
//   );

//   logger.verbose("selectElement: element.select");

//   await elementHandle.select(value || "");
// };
