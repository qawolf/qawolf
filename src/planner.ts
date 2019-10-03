import { isNil, last } from "lodash";
import { metaEvent, mousemoveData } from "rrweb/typings/types";
import { BrowserStep, Job } from "./types";
import { QAEventWithTime } from "./events";

const SCROLL_XPATH = "scroll";

export const filterEvents = (events: QAEventWithTime[]): QAEventWithTime[] => {
  return events.filter(event => {
    return (
      isMouseDownEvent(event) || isScrollEvent(event) || isTypeEvent(event)
    );
  });
};

export const findHref = (events: QAEventWithTime[]): string => {
  return (events[0] as metaEvent).data.href;
};

export const isMouseDownEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isMouseInteraction = data.source === 2;
  const isMouseDown = data.type === 1;

  return isMouseInteraction && isMouseDown && !!data.isTrusted;
};

export const isScrollEvent = (event?: QAEventWithTime): boolean => {
  // TODO: support scrolling within elements
  if (!event || !event.data) return false;

  const data = event.data;
  const isScroll = data.source === 3;
  const isPageBody = data.id === 1;

  return isScroll && isPageBody;
};

export const isTypeEvent = (event?: QAEventWithTime): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  const isInput = data.source === 5;

  return isInput && !!data.isTrusted && !isNil(data.text);
};

export const planClickSteps = (
  filteredEvents: QAEventWithTime[]
): BrowserStep[] => {
  const steps: BrowserStep[] = [];

  filteredEvents.forEach((event, i) => {
    if (!isMouseDownEvent(event)) return;
    // don't include clicks that are immediately followed by typing into same input
    const nextEvent = filteredEvents[i + 1] || {};
    if (isTypeEvent(nextEvent) && nextEvent.data.xpath === event.data.xpath) {
      return;
    }

    steps.push({
      locator: event.data.properties,
      pageId: event.pageId,
      sourceEventId: event.id,
      type: "click"
    });
  });

  return steps;
};

export const planTypeSteps = (
  filteredEvents: QAEventWithTime[]
): BrowserStep[] => {
  const steps: BrowserStep[] = [];

  const groupedEvents: QAEventWithTime[][] = [];
  let currentGroup: QAEventWithTime[] = [];
  let lastXpath = null;

  filteredEvents.forEach((event, i) => {
    const isType = isTypeEvent(event);
    if (isType) {
      currentGroup.push(event);
      lastXpath = event.data.xpath;
    }

    const isNewXpath =
      filteredEvents[i + 1] &&
      filteredEvents[i + 1].data.xpath !== event.data.xpath;
    if (!isType || isNewXpath) {
      if (currentGroup.length) groupedEvents.push(currentGroup);
      currentGroup = [];
    }
  });

  groupedEvents.forEach(group => {
    const lastEvent = last(group) as QAEventWithTime;
    steps.push({
      locator: lastEvent.data.properties,
      pageId: lastEvent.pageId,
      sourceEventId: lastEvent.id,
      type: "type",
      value: lastEvent.data.text
    });
  });

  return steps;
};

// export const orderEventsByTime = (
//   events: eventWithTime[]
// ): QAEventWithTime[] => {
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
//   events: QaEventWithTime[],
//   eventType: "scroll" | "type"
// ): QaEventWithTime[][] => {
//   const filteredEvents = events.filter(event => {
//     return (
//       isMouseDownEvent(event) || isScrollEvent(event) || isTypeEvent(event)
//     );
//   });

//   const groupedScrollEvents: QaEventWithTime[][] = [];
//   let currentScrollEvents: QaEventWithTime[] = [];
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

// export const planClickActions = (events: QaEventWithTime[]): BrowserStep[] => {
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

// export const planScrollActions = (events: QaEventWithTime[]): BrowserStep[] => {
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

// export const planTypeActions = (events: QaEventWithTime[]): BrowserStep[] => {
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
