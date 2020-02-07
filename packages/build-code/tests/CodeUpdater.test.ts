test("TODO: this test will be removed after the refactor", () => {});

// import { loadEvents } from "@qawolf/fixtures";
// import { ElementEvent } from "@qawolf/types";
// import { CodeUpdater, CREATE_CODE_SYMBOL } from "../src/CodeUpdater";
// import { chunk, last, pick } from "lodash";

// let events: ElementEvent[];

// beforeAll(async () => {
//   events = await loadEvents("scroll_login");
// });

// describe("CodeUpdater.prepareSteps", () => {
//   it("appends new steps", () => {
//     const codeUpdater = new CodeUpdater({ name: "myTest", url: "localhost" });

//     let numSteps = 0;

//     let stepEvents: any[] = [];

//     events.forEach(event => {
//       codeUpdater.prepareSteps({ newEvents: [event], onlyFinalSteps: true });

//       // track each event that causes a step to be created
//       if (codeUpdater._steps.length !== numSteps) {
//         stepEvents.push({
//           event: pick(event, "name", "value"),
//           step: last(codeUpdater._steps)!.action
//         });

//         numSteps = codeUpdater._steps.length;
//       }
//     });

//     // test the events and new steps align properly
//     expect(stepEvents).toMatchSnapshot();
//   });
// });

// describe("CodeUpdater.updateCode", () => {
//   it("replaces the create symbol with new steps", () => {
//     // test multiple updates
//     const chunkedEvents = chunk(events, events.length / 2);

//     for (let isTest of [false, true]) {
//       const codeUpdater = new CodeUpdater({
//         isTest,
//         name: "myTest",
//         url: "localhost"
//       });

//       expect(codeUpdater.getNumPendingSteps()).toEqual(0);

//       // test it matches indentation
//       let codeToUpdate = `  myOtherCode();\n  ${CREATE_CODE_SYMBOL}`;

//       for (let i = 0; i < chunkedEvents.length; i++) {
//         const isLastUpdate = i === chunkedEvents.length - 1;

//         codeUpdater.prepareSteps({
//           newEvents: chunkedEvents[i],
//           onlyFinalSteps: !isLastUpdate
//         });
//         expect(codeUpdater.getNumPendingSteps()).toBeGreaterThan(0);

//         codeToUpdate = codeUpdater.updateCode(codeToUpdate, isLastUpdate);
//         expect(codeToUpdate).toMatchSnapshot(
//           isTest ? `updateCode()_test${i}` : `updateCode()_script${i}`
//         );
//         expect(codeUpdater.getNumPendingSteps()).toEqual(0);
//       }
//     }
//   });
// });
