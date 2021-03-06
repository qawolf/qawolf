import { Page } from "playwright";

import { launch, LaunchResult, setBody } from "./utils";
import { QAWolfWeb } from "../src";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch({ devtools: true });
  page = launched.page;
});

// afterAll(() => launched.browser.close());

const expectSelector = async (
  selector: string,
  expected?: string
): Promise<void> => {
  const element = await page.$(selector);
  if (!element) throw new Error(`${selector} not found`);

  const builtSelector = await page.evaluate(
    ({ element }) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = qawolf.getTopmostEditableElement(element as HTMLElement);
      return qawolf.getSelector(target, 0)?.value;
    },
    { element }
  );

  expect(builtSelector).toEqual(expected || selector);
};

describe.skip("getSelector", () => {
  it("prefers test attributes", async () => {
    await setBody(page, `<button data-qa="html-button">Submit</button>`);
    await expectSelector('[data-qa="html-button"]');
  });

  it("short circuits to html and body", async () => {
    await page.evaluate(() => {
      document.querySelector("html").setAttribute("data-qa", "main");
      document.querySelector("body").setAttribute("data-qa", "container");
    });

    await expectSelector("html");
    await expectSelector("body");
  });

  it.each([
    ["<a><img></a>", "a"],
    ["<button><img></button>", "button"],
    ["<label><img></label>", "label"],
    ['<div role="button"><img></div>', '[role="button"]'],
    ['<div role="checkbox"><img></div>', '[role="checkbox"]'],
    ['<div role="radio"><img></div>', '[role="radio"]'],
  ])("targets the likely ancestor %o", async (body, expected) => {
    await setBody(page, body);
    await expectSelector("img", expected);
  });

  it("uses ancestor cues when required", async () => {
    await setBody(page, `<li><input></li><li><input></li>`);
    await expectSelector("li:nth-of-type(2) input");
  });
});

// TODO options
// ["<select><option>Hello></option></select>", "option"],

// describe.only("replace", () => {
//   const TEST_URL = "http://localhost:5000/";

//   beforeAll(() => page.goto(`${TEST_URL}buttons`));

//   it.each([
//     // selects the target
//     [['[data-qa="html-button"]', '[data-qa="html-button"]']],
//     [[".quote-button", "text=Button \"with\" extra 'quotes'"]],
//     // selects the ancestor
//     [["#html-button-child", '[data-qa="html-button-with-children"]']],
//     [[".MuiButton-label", '[data-qa="material-button"]']],
//     [".second-half.type-two"],
//     // selects the better selector for target despite having clickable ancestors
//     [['[data-for-test="selection"]', "text=Better attribute on span"]],
//   ])("builds expected selector %o", (options) => {
//     return expectSelector(options[0], options[1]);
//   });

//   describe("date pickers", () => {
//     beforeAll(() => page.goto(`${TEST_URL}date-pickers`));
//     it.each([
//       // selects the ancestor and clickable descendant
//       [
//         [
//           '[data-qa="material-date-picker"] path',
//           '[data-qa="material-date-picker"] [aria-label="change date"]',
//         ],
//       ],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("click: radio", () => {
//     beforeAll(() => page.goto(`${TEST_URL}radio-inputs`));
//     it.each([
//       [["#single", '[data-qa="html-radio"]']],
//       [[".MuiFormControlLabel-label", '[data-qa="material-radio"]']],
//       // ancestor group and descendant
//       [["#dog", '[data-qa="html-radio-group"] #dog']],
//       [["#blue", '[data-qa="material-radio-group"] #blue']],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("click: checkbox", () => {
//     beforeAll(() => page.goto(`${TEST_URL}checkbox-inputs`));
//     it.each([
//       // target checkbox/label
//       [["#single", '[data-qa="html-checkbox"]']],
//       [[".MuiFormControlLabel-label", '[data-qa="material-checkbox"]']],
//       // ancestor group and descendant
//       [["#dog", '[data-qa="html-checkbox-group"] #dog']],
//       [["#blue", '[data-qa="material-checkbox-group"] #blue']],
//       // special characters
//       [[".special\\:class", "#special\\:id"]],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("type: input", () => {
//     beforeAll(() => page.goto(`${TEST_URL}text-inputs`));
//     it.each([
//       // target input/textarea
//       [['[type="password"]', '[data-qa="html-password-input"]', false]],
//       [["textarea", '[data-qa="html-textarea"]', false]],
//       // ancestor and descendant
//       [
//         [
//           '[data-qa="material-text-input"] input',
//           '[data-qa="material-text-input"] .MuiInput-input',
//           false,
//         ],
//       ],
//       [
//         [
//           '[data-qa="material-textarea"] textarea',
//           '[data-qa="material-textarea"] .MuiInput-input',
//           false,
//         ],
//       ],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("type: content editable", () => {
//     beforeAll(() => page.goto(`${TEST_URL}content-editables`));
//     it.each([
//       [['[data-qa="content-editable"]', '[data-qa="content-editable"]', false]],
//       [
//         [
//           '[data-qa="draftjs"] [contenteditable="true"]',
//           '[data-qa="draftjs"] .public-DraftEditor-content',
//           false,
//         ],
//       ],
//       [
//         [
//           '[data-qa="quill"] [contenteditable="true"]',
//           '[data-qa="quill"] [contenteditable="true"]',
//           false,
//         ],
//       ],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("select", () => {
//     beforeAll(() => page.goto(`${TEST_URL}selects`));
//     it.each([
//       [['[data-qa="html-select"]', '[data-qa="html-select"]']],
//       // target and descendant
//       [
//         [
//           '[data-qa="material-select-native"] select',
//           '[data-qa="material-select-native"] #material-select-native',
//         ],
//       ],
//       // check the invisible text is not targeted
//       [
//         [
//           '[data-qa="material-select"] #material-select',
//           '[data-qa="material-select"] #material-select',
//         ],
//       ],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("nested data attributes", () => {
//     beforeAll(() => page.goto(`${TEST_URL}nested-data-attributes`));
//     it.each([
//       // multiple ancestors
//       [["#button", '[data-test="click"] [data-qa="button"]']],
//       // unique selectors
//       [["#unique", '[data-qa="unique"]']],
//       [["#dog-0", '[data-qa="radio-group"] #dog-0']],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
//   });
//   describe("regex attributes", () => {
//     beforeAll(() => page.goto(`${TEST_URL}nested-data-attributes`));
//     it.each([
//       [
//         [
//           "#button",
//           '[data-test="click"] [data-qa="button"]',
//           true,
//           "/^data-.*/",
//         ],
//       ],
//       // ignore non-matching attributes
//       [["#button", "#button", true, "/^qa-.*/"]],
//       // ignore invalid regex
//       [
//         [
//           "#button",
//           '[data-test="click"] [data-qa="button"]',
//           true,
//           "/[/,/^data-.*/",
//         ],
//       ],
//     ])("builds expected selector %o", (selector) => expectSelector(selector));
// });
