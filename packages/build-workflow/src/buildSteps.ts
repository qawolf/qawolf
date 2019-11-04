import { Event, KeyupEvent, ScrollEvent, Step } from "@qawolf/types";
import { concat, sortBy } from "lodash";

export const buildClickSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // ignore other actions
    if (event.name !== "click") continue;

    // ignore system initiated clicks
    if (!event.isTrusted) continue;

    // ignore clicks on (most) inputs
    if (
      event.target.inputType &&
      event.target.inputType !== "button" &&
      event.target.inputType !== "submit"
    )
      continue;

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

export const buildInputSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as KeyupEvent;

    // ignore other actions
    if (event.name !== "keyup") continue;

    // ignore system initiated clicks
    if (!event.isTrusted) continue;

    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    const lastInputToTarget =
      !nextEvent || event.target.xpath !== nextEvent.target.xpath;
    // skip to the last input on this target
    if (!lastInputToTarget) continue;

    steps.push({
      action: "type",
      // include event index so we can sort in buildSteps
      index: i,
      pageId: event.pageId,
      target: event.target,
      value: event.value
    });
  }

  return steps;
};

export const buildScrollSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as ScrollEvent;

    // ignore other actions
    if (event.name !== "scroll") continue;

    // ignore system initiated scrolls
    if (!event.isTrusted) continue;

    // skip to the last scroll on this target
    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    if (
      nextEvent &&
      nextEvent.name === "scroll" &&
      event.target.xpath === nextEvent.target.xpath
    )
      continue;

    steps.push({
      action: "scroll",
      // include event index so we can sort in buildSteps
      index: i,
      pageId: event.pageId,
      target: event.target,
      value: event.value
    });
  }

  return steps;
};

export const buildSteps = (events: Event[]): Step[] => {
  const unorderedSteps = concat(
    buildClickSteps(events),
    buildInputSteps(events),
    buildScrollSteps(events)
  );

  const steps = sortBy(
    unorderedSteps,
    // ordered by the event index
    step => step.index
  ).map<Step>((step, index) => ({ ...step, index }));

  return steps;
};
