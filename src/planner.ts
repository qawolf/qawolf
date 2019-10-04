import { mousemoveData } from "rrweb/typings/types";
import { Job } from "./types";
import { QAEventWithTime } from "./events";
import eventsToSteps from "./eventsToSteps";
import { Size } from "./browser/device";

export const findHref = (events: QAEventWithTime[]): string => {
  return events.filter(e => e.data && e.data.href)[0].data.href!;
};

export const findSize = (events: any[]): Size =>
  events.filter(e => e.type === "size")[0].size;

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
  const size = findSize(originalEvents);

  const events = orderEventsByTime(originalEvents);
  const steps = eventsToSteps(events);

  const job = { name, size, steps, url };

  return job;
};
