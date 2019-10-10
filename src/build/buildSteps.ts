import { first, isNil, last } from "lodash";
import { QAEventWithTime } from "../events";
import { Action, BrowserStep } from "../types";

type EventSequence = {
  action: Action;
  events: QAEventWithTime[];
  xpath: string | null;
};

export const isClickEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isMouseInteraction = data.source === 2;
  const isClick = data.type === 2;

  return isMouseInteraction && isClick && !!data.isTrusted;
};

export const isScrollEvent = (event?: QAEventWithTime): boolean => {
  // TODO: support scrolling within elements
  if (!event || !event.data) return false;

  const data = event.data;
  const isScroll = data.source === 3;
  const isPageBody = data.id === 1;

  return isScroll && isPageBody;
};

export const isInputEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isInput = data.source === 5;

  return isInput && !!data.isTrusted && !isNil(data.text);
};

export const findActionEvents = (
  events: QAEventWithTime[]
): QAEventWithTime[] => {
  return events.filter(event => {
    return isClickEvent(event) || isInputEvent(event) || isScrollEvent(event);
  });
};

export const getEventAction = (event: QAEventWithTime): Action => {
  if (isClickEvent(event)) return "click";
  if (isInputEvent(event)) return "input";
  if (isScrollEvent(event)) return "scroll";

  throw new Error(`Action not found for event ${event}`);
};

export const groupEventSequences = (
  events: QAEventWithTime[]
): EventSequence[] => {
  const sequences: EventSequence[] = [];

  let sequence: EventSequence | null = null;
  events.forEach(event => {
    const action = getEventAction(event);
    const eventXpath = event.data.xpath || null;

    // create an event sequence for consecutive events to the same element
    if (
      !sequence ||
      action !== sequence.action ||
      eventXpath !== sequence.xpath
    ) {
      sequence = {
        action,
        events: [event],
        xpath: eventXpath
      };
      sequences.push(sequence);
    } else {
      sequence.events.push(event);
    }
  });

  return sequences;
};

export const buildClickSteps = (
  clickSequence: EventSequence,
  nextSequence: EventSequence | null
): BrowserStep[] => {
  const steps: BrowserStep[] = [];

  const willInputNext =
    nextSequence &&
    nextSequence.action === "input" &&
    nextSequence.xpath === clickSequence.xpath;

  clickSequence.events.forEach((click, i) => {
    // skip the last click if  we will input value in the same element
    const isLastClick = i === clickSequence.events.length - 1;
    if (isLastClick && willInputNext) return;

    steps.push({
      action: "click",
      locator: click.data.properties,
      pageId: click.pageId
    });
  });

  return steps;
};

export const buildInputStep = (inputSequence: EventSequence): BrowserStep => {
  const lastInput = last(inputSequence.events) as QAEventWithTime;

  return {
    action: "input",
    locator: lastInput.data.properties,
    pageId: lastInput.pageId,
    value: lastInput.data.text
  };
};

export const buildScrollStep = (
  scrollSequence: EventSequence
): BrowserStep | null => {
  const firstScroll = first(scrollSequence.events) as QAEventWithTime;
  const lastScroll = last(scrollSequence.events) as QAEventWithTime;
  // don't include scrolls where you start and end in same place
  if (firstScroll.data.y === lastScroll.data.y) return null;

  return {
    action: "scroll",
    locator: { xpath: "scroll" },
    pageId: lastScroll.pageId,
    scrollDirection: firstScroll.data.y < lastScroll.data.y ? "down" : "up",
    scrollTo: lastScroll.data.y
  };
};

export const buildSequenceSteps = (
  eventSequences: EventSequence[]
): BrowserStep[] => {
  let steps: BrowserStep[] = [];

  eventSequences.forEach((eventSequence, i) => {
    if (eventSequence.action === "input") {
      steps.push(buildInputStep(eventSequence));
    } else if (eventSequence.action === "scroll") {
      const scrollStep = buildScrollStep(eventSequence);
      if (scrollStep) steps.push(scrollStep);
    } else if (eventSequence.action === "click") {
      const nextSequence = eventSequences[i + 1] || null;
      steps = steps.concat(buildClickSteps(eventSequence, nextSequence));
    }
  });

  return steps;
};

export const buildSteps = (events: QAEventWithTime[]): BrowserStep[] => {
  const actionEvents = findActionEvents(events);
  const eventSequences = groupEventSequences(actionEvents);
  const steps = buildSequenceSteps(eventSequences);

  return steps;
};
