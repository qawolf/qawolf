import { isNil } from "lodash";
import { QAEventWithTime } from "./events";
import { StepType } from "./types";

// consecutive actions on the same element
type ActionGroup = {
  actions: QAEventWithTime[];
  type: StepType;
  xpath: string;
};

export const isMouseDownEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isMouseInteraction = data.source === 2;
  const isMouseDown = data.type === 1;

  return isMouseInteraction && isMouseDown && !!data.isTrusted;
};

export const isScrollEvent = (event?: QAEventWithTime): boolean => {
  // TODO: support scrolling within elements
  if (!event || !event.data) return false;

  const data = event.data;
  const isScroll = data.source === 3;
  const isPageBody = data.id === 1;

  return isScroll && isPageBody;
};

export const isTypeEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isInput = data.source === 5;

  return isInput && !!data.isTrusted && !isNil(data.text);
};

export const findActions = (events: QAEventWithTime[]): QAEventWithTime[] => {
  return events.filter(event => {
    return (
      isMouseDownEvent(event) || isScrollEvent(event) || isTypeEvent(event)
    );
  });
};

export const getActionType = (action: QAEventWithTime): StepType => {
  if (isMouseDownEvent(action)) return "click";
  if (isScrollEvent(action)) return "scroll";
  if (isTypeEvent(action)) return "type";

  throw `Action type not found for ${action}`;
};

export const groupActions = (actions: QAEventWithTime[]): ActionGroup[] => {
  const actionGroups: ActionGroup[] = [];

  let currentActionGroup: ActionGroup | null = null;
  actions.forEach(action => {
    const actionType = getActionType(action);
    const actionXpath = action.data.xpath;

    if (
      !currentActionGroup ||
      actionType !== currentActionGroup.type ||
      actionXpath !== currentActionGroup.xpath
    ) {
      if (currentActionGroup) actionGroups.push(currentActionGroup);
      currentActionGroup = {
        actions: [action],
        type: actionType,
        xpath: actionXpath!
      };
    } else {
      currentActionGroup.actions.push(action);
    }
  });

  if (currentActionGroup) actionGroups.push(currentActionGroup);

  return actionGroups;
};

export const compressActions = (
  actionGroups: QAEventWithTime[][]
): QAEventWithTime[] => {
  // if group of scrolls take the last one
  // take each click except those followed immediately by a type on same element
  // take last type
  return [];
};

export default (events: QAEventWithTime[]): QAEventWithTime[] => {
  const actions = findActions(events);
  const actionGroups = groupActions(actions);
  // put it all together

  return [];
};
