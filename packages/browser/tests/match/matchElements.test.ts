// import { CONFIG } from "@qawolf/config";
// import { Match, QAWolfWeb } from "@qawolf/web";
// import { Browser } from "../../src/Browser";

// TODO port test

// describe("matchElements", () => {
//   it("returns elements that match if data attribute specified", async () => {
//     const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
//     const page = await browser.currentPage();

//     const result = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;

//       const username = document.getElementById("username")!;
//       username.setAttribute("data-qa", "username");

//       const password = document.getElementById("password")!;
//       password.setAttribute("data-qa", "username");

//       const collection = document.querySelectorAll("input,button");
//       const elements: HTMLElement[] = [];

//       for (let i = 0; i < collection.length; i++) {
//         elements.push(collection[i] as HTMLElement);
//       }

//       const matches = qawolf.match.matchElements({
//         dataAttribute: "data-qa",
//         target: {
//           dataValue: "username",
//           labels: ["username"],
//           tagName: "input"
//         },
//         elements
//       });

//       username.removeAttribute("data-qa");
//       password.removeAttribute("data-qa");

//       return matches.map((match: Match) => {
//         return {
//           element: qawolf.xpath.getXpath(match.element),
//           targetMatches: match.targetMatches,
//           value: match.value
//         };
//       });
//     });

//     expect(result).toEqual([
//       {
//         element: "//*[@id='username']",
//         targetMatches: [
//           { key: "dataValue", percent: 100 },
//           { key: "labels", percent: 100 },
//           { key: "tagName", percent: 100 }
//         ],
//         value: 300
//       },
//       {
//         element: "//*[@id='password']",
//         targetMatches: [
//           { key: "dataValue", percent: 100 },
//           { key: "tagName", percent: 100 }
//         ],
//         value: 200
//       }
//     ]);

//     await browser.close();
//   });

//   it("returns elements that match if data attribute not specified", async () => {
//     const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
//     const page = await browser.currentPage();

//     const result = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;

//       const collection = document.querySelectorAll("input,button");
//       const elements: HTMLElement[] = [];

//       for (let i = 0; i < collection.length; i++) {
//         elements.push(collection[i] as HTMLElement);
//       }

//       const matches = qawolf.match.matchElements({
//         dataAttribute: null,
//         target: { labels: ["username"], tagName: "input" },
//         elements
//       });

//       return matches.map((match: Match) => {
//         return {
//           element: qawolf.xpath.getXpath(match.element),
//           targetMatches: match.targetMatches,
//           value: match.value
//         };
//       });
//     });

//     expect(result).toEqual([
//       {
//         element: "//*[@id='username']",
//         targetMatches: [
//           { key: "labels", percent: 100 },
//           { key: "tagName", percent: 100 }
//         ],
//         value: 200
//       }
//     ]);

//     await browser.close();
//   });

//   it("returns empty array if strong matches required and none found", async () => {
//     const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
//     const page = await browser.currentPage();

//     const result = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;

//       const collection = document.querySelectorAll("input,button");
//       const elements: HTMLElement[] = [];

//       for (let i = 0; i < collection.length; i++) {
//         elements.push(collection[i] as HTMLElement);
//       }

//       const matches = qawolf.match.matchElements({
//         dataAttribute: null,
//         target: { tagName: "input" },
//         elements,
//         requireStrongMatch: true
//       });

//       return matches.map((match: Match) => {
//         return {
//           element: qawolf.xpath.getXpath(match.element),
//           targetMatches: match.targetMatches,
//           value: match.value
//         };
//       });
//     });

//     expect(result).toEqual([]);

//     await browser.close();
//   });
// });
