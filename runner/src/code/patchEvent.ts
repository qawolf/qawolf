import { TextOperation } from "../types";
import { insertEvent, PatchEventOptions } from "./insertEvent";
import { patchCheckOrUncheck } from "./patchCheckOrUncheck";
import { patchFillOrSelectOption } from "./patchFillOrSelectOption";
import { patchPopup } from "./patchPopup";
import { patchReload } from "./patchReload";
import { PATCH_HANDLE } from "./patchUtils";

export const patchEvent = (options: PatchEventOptions): TextOperation[] => {
  const { code, event } = options;
  const patchIndex = code.indexOf(PATCH_HANDLE);
  if (patchIndex < 0) return [];

  if (["check", "uncheck"].includes(event.action))
    return patchCheckOrUncheck(options);

  if (["fill", "selectOption"].includes(event.action))
    return patchFillOrSelectOption(options);

  if (event.action === "popup") return patchPopup(options);
  if (event.action === "reload") return patchReload(options);

  return insertEvent(options);
};
