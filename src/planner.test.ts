// import fs from "fs-extra";
// import { qaEventWithTime } from "./events";
// import {
//   findHref,
//   orderEventsByTime,
//   planTypeActions,
//   planClickActions,
//   planJob
// } from "./planner";
// import { BrowserStep } from "./types";

// let originalEvents: qaEventWithTime[];
// let events: qaEventWithTime[];

// beforeAll(async () => {
//   // XXX turn into helper in qawolf-fixtures
//   const json = await fs.readFile(
//     "node_modules/@jperl/qawolf-fixtures/events/google_search.events",
//     "utf8"
//   );

//   originalEvents = JSON.parse(json);
//   events = orderEventsByTime(originalEvents);
// });

// test("findHref finds the href from events", () => {
//   const href = findHref(events);
//   expect(href).toBe("https://www.google.com/");
// });

// test("planTypeActions squashes consecutive input events", () => {
//   const actions = planTypeActions(events);
//   expect(actions).toEqual([
//     {
//       locator: {
//         xpath: "//*[@id='tsf']/div[2]/div[1]/div[1]/div/div[2]/input"
//       },
//       sourceEventId: 47,
//       type: "type",
//       value: "qawolf github"
//     }
//   ]);
// });

// test("planClickActions turns mouse down events into click actions", () => {
//   const actions = planClickActions(events);
//   expect(actions).toEqual([
//     {
//       locator: {
//         xpath: "//*[@id='tsf']/div[2]/div[1]/div[1]/div/div[2]/input"
//       },
//       sourceEventId: 14,
//       type: "click"
//     },
//     {
//       locator: {
//         xpath: "//*[@id='tsf']/div[2]/div[1]/div[3]/center/input[1]"
//       },
//       sourceEventId: 53,
//       type: "click"
//     }
//   ]);
// });

// test("planJob sorts steps by their original time", () => {
//   const job = planJob(events);
//   expect(job.steps.map((s: BrowserStep) => s.sourceEventId)).toEqual([
//     14,
//     47,
//     53
//   ]);
// });
