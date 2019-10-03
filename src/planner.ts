import { metaEvent, mousemoveData } from "rrweb/typings/types";
import { Job } from "./types";
import { QAEventWithTime } from "./events";
import eventsToSteps from "./eventsToSteps";

export const findHref = (events: QAEventWithTime[]): string => {
  return (events[0] as metaEvent).data.href;
};

export const orderEventsByTime = (
  events: QAEventWithTime[]
): QAEventWithTime[] => {
  const orderedEvents = [];

  for (let originalEvent of events) {
    let event = JSON.parse(JSON.stringify(originalEvent));

    // replace negative timeOffsets so we can correctly order events by timestamp
    const positions =
      (event.data && (event.data as mousemoveData).positions) || [];
    if (positions.length) {
      const firstOffset = positions[0].timeOffset;
      event.timestamp += firstOffset;
      for (const position of positions) {
        position.timeOffset -= firstOffset;
      }
    }

    orderedEvents.push(event);
  }

  orderedEvents.sort((a, b) => a.timestamp - b.timestamp);

  return orderedEvents;
};

export const planJob = (
  originalEvents: QAEventWithTime[],
  name: string
): Job => {
  const url = findHref(originalEvents);

  const events = orderEventsByTime(originalEvents);
  const steps = eventsToSteps(events);

  const job = { name, steps, url };

  return job;
};
