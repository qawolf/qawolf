import { logger } from "@qawolf/logger";
import { Event, KeyEvent, Step } from "@qawolf/types";
import { isKeyEvent } from "@qawolf/web";

export const buildClickSteps = (events: Event[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // ignore other actions
    if (event.name !== "click") continue;

    // ignore system initiated clicks
    if (!event.isTrusted) continue;

    // ignore clicks on selects
    if (
      event.target.tagName &&
      event.target.tagName!.toLowerCase() === "select"
    )
      continue;

    // ignore clicks on (most) inputs
    if (
      event.target.inputType &&
      event.target.inputType !== "button" &&
      event.target.inputType !== "checkbox" &&
      event.target.inputType !== "radio" &&
      event.target.inputType !== "submit"
    )
      continue;

    // ignore click on submit inputs after an "Enter"
    // they trigger a click we do not want to duplicate
    const isSubmitAfterEnter =
      event.target.inputType === "submit" &&
      isKeyEvent(events[i - 1]) &&
      (events[i - 1] as KeyEvent).value === "Enter" &&
      // the events should trigger very closely
      event.time - events[i - 1].time < 100;
    if (isSubmitAfterEnter) {
      logger.verbose(
        `skipping submit ${event.time} after enter ${events[i - 1].time}`
      );
      continue;
    }

    // ignore clicks on content editables
    if (event.target.isContentEditable) continue;

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
