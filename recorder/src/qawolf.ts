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
export { resolveAction } from "./resolveAction";
export { buildElementText, buildSelectorForCues } from "./selectorEngine";

import { ElementChooser } from "./ElementChooser";

export const elementChooser = new ElementChooser();
