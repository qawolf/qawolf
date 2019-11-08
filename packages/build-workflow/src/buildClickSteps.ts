import { Event, Step } from "@qawolf/types";

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
    if (event.target.inputType && event.target.inputType !== "button") continue;

    // ignore clicks on contented itables
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
