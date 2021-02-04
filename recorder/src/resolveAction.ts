import { getTopmostEditableElement } from "./element";
import { nodeToDoc } from "./serialize";
import { shouldTrackKeyPress } from "./shouldTrackKeyPress";
import { shouldTrackFill } from "./shouldTrackFill";
import { Action, PossibleAction } from "./types";

export const resolveAction = (
  possibleAction: PossibleAction,
  lastPossibleAction: PossibleAction | undefined
): Action | undefined => {
  // Never emit actions for untrusted events
  if (!possibleAction.isTrusted) {
    console.debug("resolveAction: ignoring untrusted action");
    return;
  }

  // skip system-initiated clicks triggered by a key press
  // ex. "Enter" triggers a click on a submit input
  if (
    possibleAction.action === "click" &&
    lastPossibleAction &&
    ["fill", "press"].includes(lastPossibleAction.action) &&
    possibleAction.time - lastPossibleAction.time < 50
  ) {
    console.debug("resolveAction: ignoring system-initiated click");
    return;
  }

  // This should stay here to keep this fast. Put checks that don't rely on
  // target before this, and checks that do after this.
  const target = getTopmostEditableElement(
    possibleAction.target as HTMLElement
  );

  const targetDoc = nodeToDoc(target);
  let action = possibleAction.action as Action;

  if (targetDoc.name === "select") {
    // On selects, ignore everything except fill actions (input / change events)
    if (action !== "fill") {
      console.debug(
        "resolveAction: ignoring non-fill action on a select element"
      );
      return;
    }
    action = "selectOption";
  }

  if (
    action === "press" &&
    !shouldTrackKeyPress(possibleAction.value, targetDoc)
  ) {
    console.debug(
      "resolveAction: ignoring press action for an unimportant key or target"
    );
    return;
  }

  if (action === "fill" && !shouldTrackFill(targetDoc)) {
    console.debug(
      "resolveAction: ignoring fill action for an unimportant target"
    );
    return;
  }

  return action;
};
