import { BrowserStep, Event, InputEvent } from "@qawolf/types";
import { parseDate } from "chrono-node";
import { concat, sortBy } from "lodash";

const isDateInputEvent = (event: Event) => {
  const inputEvent = event as InputEvent;
  return (
    event.action === "input" && inputEvent.value && parseDate(inputEvent.value)
  );
};

export const buildClickSteps = (events: Event[]): BrowserStep[] => {
  const steps: BrowserStep[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // ignore other actions
    if (event.action !== "click") continue;

    // ignore system initiated clicks
    if (!event.isTrusted) continue;

    // ignore clicks on (most) inputs
    if (
      event.target.inputType &&
      event.target.inputType !== "button" &&
      event.target.inputType !== "submit"
    )
      continue;

    // skip clicks before a date input
    // since we assume it triggers the date input event
    // ex. a date picker button
    if (i + 1 < events.length && isDateInputEvent(events[i + 1])) continue;

    steps.push({
      action: "click",
      // include event index so we can sort in buildSteps
      index: i,
      pageId: event.pageId,
      target: event.target
    });
  }

  return steps;
};

export const buildInputSteps = (events: Event[]): BrowserStep[] => {
  const steps: BrowserStep[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as InputEvent;

    // ignore other actions
    if (event.action !== "input") continue;

    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    const lastInputToTarget =
      !nextEvent || event.target.xpath !== nextEvent.target.xpath;
    // skip to the last input on this target
    if (!lastInputToTarget) continue;

    // include user events and date input events
    if (event.isTrusted || isDateInputEvent(event)) {
      steps.push({
        action: "input",
        // include event index so we can sort in buildSteps
        index: i,
        pageId: event.pageId,
        target: event.target,
        value: event.value
      });
    }
  }

  return steps;
};

export const buildSteps = (events: Event[]): BrowserStep[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildInputSteps(events)
  );

  const steps = sortBy(
    unorderedSteps,
    // ordered by the event index
    step => step.index
  ).map<BrowserStep>((step, index) => ({ ...step, index }));

  return steps;
};
