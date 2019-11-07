import { Event, InputEvent, Step } from "@qawolf/types";

export const buildSelectSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as InputEvent;

    // ignore system initiated actions & other non-input actions
    if (!event.isTrusted || event.name !== "input") continue;

    // XXX maybe?
    // const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    // const lastInputToTarget =
    //   !nextEvent || event.target.xpath !== nextEvent.target.xpath;
    // // skip to the last input on this target
    // if (!lastInputToTarget) continue;

    steps.push({
      action: "select",
      // include event index so we can sort in buildSteps
      index: i,
      pageId: event.pageId,
      target: event.target,
      value: event.value
    });
  }

  return steps;
};
