import {
  ElementDescriptor,
  Event,
  KeyEvent,
  ScrollEvent,
  Step
} from "@qawolf/types";
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

export const buildTypeSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  // group keyup events into one type step
  let target: ElementDescriptor | null = null;
  let keys: any[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as KeyEvent;

    // ignore other events & system initiated clicks
    if (
      !event.isTrusted ||
      (event.name !== "keydown" && event.name !== "keyup")
    )
      continue;

    keys.push(`${event.name === "keydown" ? "↓" : "↑"}${event.value}`);

    // set the target on the first event
    if (target === null) target = event.target;

    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    const lastKeyEvent =
      !nextEvent ||
      (nextEvent.name !== "keyup" && nextEvent.name !== "keydown");

    // skip to the last key event
    if (!lastKeyEvent) continue;

    // on the last keyup on this target create the type step
    steps.push({
      action: "type",
      // include event index so we can sort in buildSteps
      index: i,
      pageId: event.pageId,
      target: target,
      value: keys
    });

    keys = [];
    target = null;
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
    buildTypeSteps(events),
    buildScrollSteps(events)
  );

  const steps = sortBy(
    unorderedSteps,
    // ordered by the event index
    step => step.index
  ).map<Step>((step, index) => ({ ...step, index }));

  return steps;
};
