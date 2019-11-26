// import { logger } from "@qawolf/logger";
// import { Event, KeyEvent, Step } from "@qawolf/types";
// import { isKeyEvent, isTypeEvent } from "@qawolf/web";

// export const buildClickSteps = (events: Event[]): Step[] => {
//   const steps: Step[] = [];

//   for (let i = 0; i < events.length; i++) {
//     const event = events[i];

//     // ignore other actions
//     if (event.name !== "click") continue;

//     // ignore system initiated clicks
//     if (!event.isTrusted) continue;

//     // ignore clicks on selects
//     if (
//       event.target.tagName &&
//       event.target.tagName!.toLowerCase() === "select"
//     )
//       continue;

//     // ignore clicks on (most) inputs
//     // when the click is followed by a type event
//     const nextEvent = i + 1 < events.length ? events[i + 1] : null;
//     if (
//       isTypeEvent(nextEvent) &&
//       event.target.inputType &&
//       event.target.inputType !== "button" &&
//       event.target.inputType !== "checkbox" &&
//       event.target.inputType !== "radio" &&
//       event.target.inputType !== "submit"
//     ) {
//       continue;
//     }

//     // ignore clicks on submit inputs after an "Enter"
//     // they trigger a click we do not want to duplicate
//     const previousEvent = events[i - 1];
//     const isSubmitAfterEnter =
//       event.target.inputType === "submit" &&
//       isKeyEvent(previousEvent) &&
//       (previousEvent as KeyEvent).value === "Enter" &&
//       // the events should trigger very closely
//       event.time - previousEvent.time < 100;
//     if (isSubmitAfterEnter) {
//       logger.verbose(
//         `skipping submit ${event.time} after enter ${events[i - 1].time}`
//       );
//       continue;
//     }

//     // ignore clicks on content editables
//     if (event.target.isContentEditable) continue;

//     steps.push({
//       action: "click",
//       // include event index so we can sort in buildSteps
//       index: i,
//       pageId: event.pageId,
//       target: event.target
//     });
//   }

//   return steps;
// };
