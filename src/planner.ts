import { isNil } from "lodash";
import { eventWithTime, metaEvent, mousemoveData } from "rrweb/typings/types";
import { BrowserStep, Job } from "./types";
import { qaEventWithTime } from "./events";

const SCROLL_XPATH = "scroll";

export const isMouseDownEvent = (event: qaEventWithTime): boolean => {
  if (!event.data) return false;

  const data = event.data;
  const isMouseInteraction = data.source === 2;
  const isMouseDown = data.type === 1;

  return isMouseInteraction && isMouseDown && !!data.isTrusted;
};

export const isScrollEvent = (event: qaEventWithTime): boolean => {
  // TODO: support scrolling within elements
  if (!event.data) return false;

  const data = event.data;
  const isScroll = data.source === 3;
  const isPageBody = data.id === 1;

  return isScroll && isPageBody;
};

export const isTypeEvent = (event: qaEventWithTime): boolean => {
  if (!event.data) return false;

  const data = event.data;
  const isInput = data.source === 5;

  return isInput && !!data.isTrusted && !isNil(data.text);
};

// export const findHref = (events: eventWithTime[]): string =>
//   (events[0] as metaEvent).data.href;

// export const orderEventsByTime = (
//   events: eventWithTime[]
// ): qaEventWithTime[] => {
//   const orderedEvents = [];

//   for (let originalEvent of events) {
//     let event = JSON.parse(JSON.stringify(originalEvent));

//     // replace negative timeOffsets so we can correctly order events by timestamp
//     const positions =
//       (event.data && (event.data as mousemoveData).positions) || [];
//     if (positions.length) {
//       const firstOffset = positions[0].timeOffset;
//       event.timestamp += firstOffset;
//       for (const position of positions) {
//         position.timeOffset -= firstOffset;
//       }
//     }

//     orderedEvents.push(event);
//   }

//   orderedEvents.sort((a, b) => a.timestamp - b.timestamp);

//   orderedEvents.forEach((event, index) => (event.id = index));

//   return orderedEvents;
// };

// const groupEvents = (
//   events: qaEventWithTime[],
//   eventType: "scroll" | "type"
// ): qaEventWithTime[][] => {
//   const filteredEvents = events.filter(event => {
//     return (
//       isMouseDownEvent(event) || isScrollEvent(event) || isTypeEvent(event)
//     );
//   });

//   const groupedScrollEvents: qaEventWithTime[][] = [];
//   let currentScrollEvents: qaEventWithTime[] = [];
//   const checkEventFn = eventType === "scroll" ? isScrollEvent : isTypeEvent;

//   filteredEvents.forEach(event => {
//     if (checkEventFn(event)) {
//       currentScrollEvents.push(event);
//     } else if (currentScrollEvents.length > 1) {
//       // don't include single scroll events as meaningful scrolls include several events
//       // this ignores situations where fingers are on trackpad but screen actually doesn't move
//       groupedScrollEvents.push(currentScrollEvents);
//       currentScrollEvents = [];
//     } else {
//       currentScrollEvents = [];
//     }
//   });

//   if (currentScrollEvents.length > 1) {
//     groupedScrollEvents.push(currentScrollEvents);
//   }

//   return groupedScrollEvents;
// };

// export const planClickActions = (events: qaEventWithTime[]): BrowserStep[] => {
//   const steps: BrowserStep[] = [];

//   for (let event of events) {
//     if (!isMouseDownEvent(event)) continue;

//     steps.push({
//       locator: (event.data as any).properties,
//       pageId: event.pageId,
//       sourceEventId: event.id,
//       type: "click"
//     });
//   }

//   return steps;
// };

// export const planJob = (originalEvents: eventWithTime[], name: string): Job => {
//   const url = findHref(originalEvents);

//   const events = orderEventsByTime(originalEvents);

//   const steps: BrowserStep[] = planClickActions(events)
//     .concat(planScrollActions(events))
//     .concat(planTypeActions(events));
//   steps.sort((a, b) => a.sourceEventId - b.sourceEventId);

//   const job = { name, steps, url };

//   return job;
// };

// export const planScrollActions = (events: qaEventWithTime[]): BrowserStep[] => {
//   const groupedScrollEvents = groupEvents(events, "scroll");
//   const steps: BrowserStep[] = [];

//   groupedScrollEvents.forEach(eventList => {
//     const lastEvent = eventList[eventList.length - 1];

//     steps.push({
//       locator: { xpath: SCROLL_XPATH },
//       pageId: (lastEvent as any).pageId,
//       scrollDirection: eventList[0].data.y <= lastEvent.data.y ? "down" : "up",
//       scrollTo: lastEvent.data.y,
//       sourceEventId: lastEvent.id,
//       type: "scroll"
//     });
//   });

//   return steps;
// };

// export const planTypeActions = (events: qaEventWithTime[]): BrowserStep[] => {
//   const steps: BrowserStep[] = [];

//   let lastXpath = null;

//   for (let i = events.length - 1; i >= 0; i--) {
//     const event = events[i];
//     if (!isTypeEvent(event)) continue;

//     // only include last consecutive type per xpath
//     if (event.data.xpath === lastXpath) continue;

//     steps.push({
//       locator: (event.data as any).properties,
//       pageId: (event as any).pageId,
//       sourceEventId: event.id,
//       type: "type",
//       value: event.data.text
//     });

//     lastXpath = event.data.xpath;
//   }

//   return steps;
// };

// export const planTypeActions = (events: qaEventWithTime[]): BrowserStep[] => {
//   const groupedTypeEvents = groupEvents(events, "type");
//   const steps: BrowserStep[] = [];

//   groupedTypeEvents.forEach(eventList => {
//     let lastXpath = null;

//     for (let i = eventList.length - 1; i >= 0; i--) {
//       const event = events[i];

//       // only include last consecutive type per xpath
//       if (event.data.xpath === lastXpath) continue;

//       steps.push({
//         locator: (event.data as any).properties,
//         pageId: (event as any).pageId,
//         sourceEventId: event.id,
//         type: "type",
//         value: event.data.text
//       });

//       lastXpath = event.data.xpath;
//     }
//   });

//   return steps;
// };
