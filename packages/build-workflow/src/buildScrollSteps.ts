import { ElementEvent, ScrollEvent, Step } from "@qawolf/types";

export const buildScrollSteps = (events: ElementEvent[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as ScrollEvent;

    // ignore other actions
    if (event.name !== "scroll") continue;

    // ignore system initiated scrolls
    if (!event.isTrusted) continue;

    // skip to the last scroll on this target
    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    if (nextEvent && nextEvent.name === "scroll") continue;

    steps.push({
      action: "scroll",
      html: event.target,
      // include event index so we can sort in buildSteps
      index: i,
      // it is final if there is a next, non-scroll event
      isFinal: !!nextEvent,
      page: event.page,
      value: event.value
    });
  }

  return steps;
};
