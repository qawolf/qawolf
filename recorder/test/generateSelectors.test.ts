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

describe("getSelector", () => {
  it("short circuits to html and body", async () => {
    await page.evaluate(() => {
      document.querySelector("html").setAttribute("data-qa", "main");
      document.querySelector("body").setAttribute("data-qa", "container");
    });

    await expectSelector("html");
    await expectSelector("body");
  });

  it("targets label and inputs", async () => {
    await setBody(
      page,
      `<input type="checkbox" id="dog" value="dog"><label for="dog">Dog</label>`
    );
    await expectSelector('[for="dog"]');
    await expectSelector('[value="dog"]', "#dog");
  });

  describe("ancestor cues", () => {
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

    it("targets the better selector on the descendant despite having likely ancestor", async () => {
      await setBody(page, '<a><div><img id="child"></div></a>');
      await expectSelector("img", "#child");
    });

    it("targets an input despite having a likely ancestor", async () => {
      await setBody(page, "<a><input></a>");
      await expectSelector("input", "input");
    });

    it("uses ancestor cues when required", async () => {
      await setBody(page, `<li><input></li><li><input></li>`);
      await expectSelector("li:nth-of-type(2) input");
    });
  });

  describe("test attributes", () => {
    it("includes closest test attribute", async () => {
      await setBody(
        page,
        `<fieldset data-qa="my-radio-group"><input type="radio" value="cat"></fieldset>`
      );

      await expectSelector('[data-qa="my-radio-group"] [value="cat"]');
    });

    it("prefers test attributes", async () => {
      await setBody(page, `<button data-qa="html-button">Submit</button>`);
      await expectSelector('[data-qa="html-button"]');
    });
  });
});

// describe.skip("replace", () => {
//   const TEST_URL = "http://localhost:5000/";

// describe("click: checkbox", () => {
//   beforeAll(() => page.goto(`${TEST_URL}checkbox-inputs`));
//   it.each([
//     // target checkbox/label
//     [["#single", '[data-qa="html-checkbox"]']],
//     [[".MuiFormControlLabel-label", '[data-qa="material-checkbox"]']],
//     // ancestor group and descendant
//     [["#dog", '[data-qa="html-checkbox-group"] #dog']],
//     [["#blue", '[data-qa="material-checkbox-group"] #blue']],
//     // special characters
//     [[".special\\:class", "#special\\:id"]],
//   ])("builds expected selector %o", (selector) => expectSelector(selector));
// });

// describe("type: input", () => {
//   beforeAll(() => page.goto(`${TEST_URL}text-inputs`));
//   it.each([
//     // target input/textarea
//     [['[type="password"]', '[data-qa="html-password-input"]', false]],
//     [["textarea", '[data-qa="html-textarea"]', false]],
//     // ancestor and descendant
//     [
//       [
//         '[data-qa="material-text-input"] input',
//         '[data-qa="material-text-input"] .MuiInput-input',
//         false,
//       ],
//     ],
//     [
//       [
//         '[data-qa="material-textarea"] textarea',
//         '[data-qa="material-textarea"] .MuiInput-input',
//         false,
//       ],
//     ],
//   ])("builds expected selector %o", (selector) => expectSelector(selector));
// });
// describe("type: content editable", () => {
//   beforeAll(() => page.goto(`${TEST_URL}content-editables`));
//   it.each([
//     [['[data-qa="content-editable"]', '[data-qa="content-editable"]', false]],
//     [
//       [
//         '[data-qa="draftjs"] [contenteditable="true"]',
//         '[data-qa="draftjs"] .public-DraftEditor-content',
//         false,
//       ],
//     ],
//     [
//       [
//         '[data-qa="quill"] [contenteditable="true"]',
//         '[data-qa="quill"] [contenteditable="true"]',
//         false,
//       ],
//     ],
//   ])("builds expected selector %o", (selector) => expectSelector(selector));
// });
// describe("select", () => {
//   beforeAll(() => page.goto(`${TEST_URL}selects`));
//   it.each([
//     [['[data-qa="html-select"]', '[data-qa="html-select"]']],
//     // target and descendant
//     [
//       [
//         '[data-qa="material-select-native"] select',
//         '[data-qa="material-select-native"] #material-select-native',
//       ],
//     ],
//     // check the invisible text is not targeted
//     [
//       [
//         '[data-qa="material-select"] #material-select',
//         '[data-qa="material-select"] #material-select',
//       ],
//     ],
//   ])("builds expected selector %o", (selector) => expectSelector(selector));
// });
// describe("nested data attributes", () => {
//   beforeAll(() => page.goto(`${TEST_URL}nested-data-attributes`));
//   it.each([
//     // multiple ancestors
//     [["#button", '[data-test="click"] [data-qa="button"]']],
//     // unique selectors
//     [["#unique", '[data-qa="unique"]']],
//     [["#dog-0", '[data-qa="radio-group"] #dog-0']],
//   ])("builds expected selector %o", (selector) => expectSelector(selector));
// });
// });
