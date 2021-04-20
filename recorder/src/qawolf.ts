export { ActionRecorder } from "./ActionRecorder";
export {
  generateRelativeCueSets,
  generateSortedCueSets,
} from "./generateCueSets";
export { generateSelectors, getSelector } from "./generateSelectors";
export { getCues, getTagCue } from "./getCues";
export {
  getAssertText,
  getDescriptor,
  getInputElementValue,
  getTopmostEditableElement,
  getXpath,
  isVisible,
} from "./element";
export { hasCommonAncestor, isElementMatch } from "./isElementMatch";
export { resolveElementAction } from "./resolveElementAction";
export { buildElementText, buildSelectorForCues } from "./selectorEngine";

import { ActionRecorder } from "./ActionRecorder";
import { ElementChooserController } from "./ElementChooserController";

export const actionRecorder = new ActionRecorder();

export const elementChooser = new ElementChooserController();
