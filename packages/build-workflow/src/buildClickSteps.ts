import { logger } from "@qawolf/logger";
import { ElementEvent, Step } from "@qawolf/types";
import { first, filter, last } from "lodash";

const filterClickEvents = (events: ElementEvent[]): ElementEvent[] => {
  return filter(events, (event, i) => {
    // track original event index
    (event as any).index = i;

    // ignore system initiated clicks
    if (!event.isTrusted) return false;

    // ignore other actions
    if (!["click", "mousedown"].includes(event.name)) return false;

    const previousEvent = events[i - 1];
    if (
      previousEvent &&
      ["keydown", "keyup"].includes(previousEvent.name) &&
      event.time - previousEvent.time < 50
    ) {
      // skip system-initiated clicks triggered by a key press
      // ex. "Enter" triggers a click on a submit input
      logger.verbose(`skip click shortly after previous event ${event.time}`);
      return false;
    }

    // ignore clicks on selects
    return event.target.node.name!.toLowerCase() !== "select";
  });
};

const groupClickEvents = (
  events: ElementEvent[],
  timeWindow: number = 200
): ElementEvent[][] => {
  const groupedEvents = [];
  let group: ElementEvent[] = [];

  events.forEach(event => {
    if (!group.length) {
      // first group
      group.push(event);
      return;
    }

    const lastEvent = last(group) as ElementEvent;
    if (event.time - lastEvent.time < timeWindow) {
      // event is within time window
      group.push(event);
      return;
    }

    // start a new group
    groupedEvents.push(group);
    group = [event];
  });

  if (group.length) {
    // append last group
    groupedEvents.push(group);
  }

  return groupedEvents;
};

export const buildClickSteps = (events: ElementEvent[]): Step[] => {
  const clickEvents = filterClickEvents(events);
  const groupedClickEvents = groupClickEvents(clickEvents);
  const steps: Step[] = [];

  groupedClickEvents.forEach((events, i) => {
    let event = first(events) as ElementEvent;

    const inputEvent = events.find(event => {
      const name = event.target.node.name || "";
      return name.toLowerCase() === "input";
    });
    if (inputEvent) {
      // if an event in the group is on an  input, assume the click propagated
      // to an element like a checkbox or radio, which is most accurate target
      event = inputEvent;
    }

    steps.push({
      action: "click",
      cssSelector: event.cssSelector,
      html: event.target,
      // include event index so we can sort in buildSteps
      index: (event as any).index,
      page: event.page
    });
  });

  return steps;
};
