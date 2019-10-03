import { first, isNil, last } from "lodash";
import { QAEventWithTime } from "./events";
import { BrowserStep, StepType } from "./types";

// consecutive actions on the same element
type ActionGroup = {
  actions: QAEventWithTime[];
  type: StepType;
  xpath: string | null;
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
    const actionXpath = action.data.xpath || null;

    if (
      !currentActionGroup ||
      actionType !== currentActionGroup.type ||
      actionXpath !== currentActionGroup.xpath
    ) {
      if (currentActionGroup) actionGroups.push(currentActionGroup);
      currentActionGroup = {
        actions: [action],
        type: actionType,
        xpath: actionXpath
      };
    } else {
      currentActionGroup.actions.push(action);
    }
  });

  if (currentActionGroup) actionGroups.push(currentActionGroup);

  return actionGroups;
};

export const formatClickSteps = (
  clickGroup: ActionGroup,
  nextGroup: ActionGroup | null
): BrowserStep[] => {
  // keep all clicks except for clicks on element right before typing into it
  const steps: BrowserStep[] = [];
  const isSameTypeNext =
    nextGroup &&
    nextGroup.type === "type" &&
    nextGroup.xpath === clickGroup.xpath;

  clickGroup.actions.forEach((click, i) => {
    const isLastClick = i === clickGroup.actions.length - 1;

    if (!isLastClick || !isSameTypeNext) {
      steps.push({
        locator: click.data.properties,
        pageId: click.pageId,
        type: "click"
      });
    }
  });

  return steps;
};

export const formatScrollStep = (
  scrollGroup: ActionGroup
): BrowserStep | null => {
  if (scrollGroup.actions.length < 2) {
    // meaningful scrolls will have at least several events
    // this ignores cases where fingers are on trackpad but page isn't actually scrolled
    return null;
  }
  const firstScroll = first(scrollGroup.actions) as QAEventWithTime;
  const lastScroll = last(scrollGroup.actions) as QAEventWithTime;

  return {
    locator: { xpath: "scroll" },
    pageId: lastScroll.pageId,
    scrollDirection: firstScroll.data.y <= lastScroll.data.y ? "down" : "up",
    scrollTo: lastScroll.data.y,
    type: "scroll"
  };
};

export const formatTypeStep = (typeGroup: ActionGroup): BrowserStep => {
  const lastType = last(typeGroup.actions) as QAEventWithTime;

  return {
    locator: lastType.data.properties,
    pageId: lastType.pageId,
    type: "type",
    value: lastType.data.text
  };
};

export const buildStepsFromActionGroups = (
  actionGroups: ActionGroup[]
): BrowserStep[] => {
  let steps: BrowserStep[] = [];

  actionGroups.forEach((actionGroup, i) => {
    if (actionGroup.type === "scroll") {
      const scrollStep = formatScrollStep(actionGroup);
      if (scrollStep) steps.push(scrollStep);
    } else if (actionGroup.type === "type") {
      steps.push(formatTypeStep(actionGroup));
    } else if (actionGroup.type === "click") {
      const nextGroup = actionGroups[i + 1] || null;
      steps = steps.concat(formatClickSteps(actionGroup, nextGroup));
    }
  });

  return steps;
};

export default (events: QAEventWithTime[]): BrowserStep[] => {
  const actions = findActions(events);
  const actionGroups = groupActions(actions);
  const steps = buildStepsFromActionGroups(actionGroups);

  return steps;
};
