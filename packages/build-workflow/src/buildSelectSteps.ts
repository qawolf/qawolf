import { ElementEvent, InputEvent, Step } from "@qawolf/types";

export const buildSelectSteps = (events: ElementEvent[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as InputEvent;

    // ignore system initiated actions & other non-input actions
    if (!event.isTrusted || event.name !== "input") continue;

    // ignore input events not on selects
    if (event.target.node.name !== "select") continue;

    steps.push({
      action: "select",
      cssSelector: event.cssSelector,
      html: event.target,
      // include event index so we can sort in buildSteps
      index: i,
      page: event.page,
      value: event.value
    });
  }

  return steps;
};
