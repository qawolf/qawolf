import { Page } from "playwright";

import { launch, LaunchResult, setBody } from "./utils";
import { QAWolfWeb } from "../src";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

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
  describe("ancestor cues", () => {
    it.each([
      ["<a><img></a>", "a"],
      ["<button><img></button>", "button"],
      ['<div role="button"><img></div>', '[role="button"]'],
      ['<div role="checkbox"><img></div>', '[role="checkbox"]'],
      ['<div role="radio"><img></div>', '[role="radio"]'],
      ["<label><img></label>", "label"],
    ])("targets the likely ancestor %o", async (body, expected) => {
      await setBody(page, body);
      await expectSelector("img", expected);
    });

    it("targets the better selector on the descendant despite having likely ancestor", async () => {
      await setBody(page, '<a><div><img id="child"></div></a>');
      await expectSelector("img", "#child");
    });

    it("targets a contenteditable/input/textarea despite having a likely ancestor", async () => {
      await setBody(page, '<a><div contenteditable="true"></div></a>');
      await expectSelector(
        '[contenteditable="true"]',
        '[contenteditable="true"]'
      );

      await setBody(page, "<a><input></a>");
      await expectSelector("input", "input");

      await setBody(page, "<a><textarea></textarea></a>");
      await expectSelector("textarea", "textarea");
    });

    it("uses ancestor cues when required", async () => {
      await setBody(page, `<li><input></li><li><input></li>`);
      await expectSelector("li:nth-of-type(2) input");
    });
  });

  it("escapes special characters", async () => {
    await setBody(page, `<div id="special:id"></div>`);
    await expectSelector("#special\\:id");
  });

  it("short circuits to html and body", async () => {
    await page.evaluate(() => {
      document.querySelector("html").setAttribute("data-qa", "main");
      document.querySelector("body").setAttribute("data-qa", "container");
    });

    await expectSelector("html");
    await expectSelector("body");
  });

  it("targets label and checkbox input", async () => {
    await setBody(
      page,
      `<input type="checkbox" id="dog" value="dog"><label for="dog">Dog</label>`
    );
    await expectSelector('[for="dog"]');
    await expectSelector('[value="dog"]', "#dog");
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
