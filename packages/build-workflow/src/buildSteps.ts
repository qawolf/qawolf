// import { Event, Step } from "@qawolf/types";
// import { concat, sortBy } from "lodash";
// import { buildClickSteps } from "./buildClickSteps";
// import { buildScrollSteps } from "./buildScrollSteps";
// import { buildSelectSteps } from "./buildSelectSteps";
// import { buildTypeSteps } from "./buildTypeSteps";

// export const buildSteps = (events: Event[]): Step[] => {
//   const unorderedSteps = concat(
//     buildClickSteps(events),
//     buildScrollSteps(events),
//     buildSelectSteps(events),
//     buildTypeSteps(events)
//   );

//   const steps = sortBy(
//     unorderedSteps,
//     // ordered by the event index
//     step => step.index
//   ).map<Step>((step, index) => ({ ...step, index }));

//   return steps;
// };
