import { logger } from "@qawolf/logger";
import { Event, Step } from "@qawolf/types";
import { isTypeEvent } from "@qawolf/web";

export const buildClickSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // ignore other actions
    if (event.name !== "click") continue;

    // ignore system initiated clicks
    if (!event.isTrusted) continue;

    const target = event.target.node;

    // ignore clicks on selects
    if (target.name!.toLowerCase() === "select") continue;

    // ignore click followed by a type with the same target
    const nextEvent = i + 1 < events.length ? events[i + 1] : null;
    if (
      isTypeEvent(nextEvent) &&
      JSON.stringify(event.target) === JSON.stringify(nextEvent!.target)
    ) {
      logger.verbose(`skip click before type ${event.time}`);
      continue;
    }

    const previousEvent = events[i - 1];
    if (previousEvent && event.time - previousEvent.time < 50) {
      // skip system-initiated clicks -- those shortly after the previous event
      // - "Enter" triggers a click on a submit input
      // - click on a label triggers click on a checkbox
      logger.verbose(`skip click shortly after previous event ${event.time}`);
      continue;
    }

    steps.push({
      action: "click",
      html: event.target,
      // include event index so we can sort in buildSteps
      index: i,
      page: event.page
    });
  }

  return steps;
};
