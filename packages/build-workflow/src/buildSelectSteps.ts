import { Event, InputEvent, Step } from "@qawolf/types";

export const buildSelectSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as InputEvent;

    // ignore system initiated actions & other non-input actions
    if (!event.isTrusted || event.name !== "input") continue;

    // ignore input events not on selects
    if (event.target.node.name !== "select") continue;

    steps.push({
      action: "select",
      // include event index so we can sort in buildSteps
      index: i,
      page: event.page,
      selector: event.target,
      value: event.value
    });
  }

  return steps;
};
