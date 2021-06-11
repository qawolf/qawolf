import { Page } from "playwright";

import { launch, LaunchResult, setBody } from "./utils";
import { QAWolfWeb } from "../src";
import { RankedSelector } from "../src/types";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

describe("generateSelectors", () => {
  const generateSelectors = async (
    selector: string,
    limit = 10
  ): Promise<RankedSelector[]> => {
    const element = await page.$(selector);
    if (!element) throw new Error(`${selector} not found`);

    const result = await page.evaluate(
      ({ element, limit }) => {
        const result: RankedSelector[] = [];

        const qawolf: QAWolfWeb = (window as any).qawolf;

        const generator = qawolf.generateSelectors(element as HTMLElement, 0);
        for (const value of generator) {
          result.push(value);
          if (result.length >= limit) break;
        }

        return result;
      },
      { element, limit }
    );

    return result;
  };

  it("generates multiple selectors", async () => {
    await setBody(
      page,
      '<input aria-label="phone number" id="phone" placeholder="Enter your phone number">'
    );

    const values = await generateSelectors("input");
    expect(values.map((v) => v.selector)).toEqual([
      '[aria-label="phone number"]',
      "#phone",
      '[placeholder="Enter your phone number"]',
      '[aria-label="phone number"]#phone',
      "input",
      '[aria-label="phone number"][placeholder="Enter your phone number"]',
      '#phone[placeholder="Enter your phone number"]',
      'body [aria-label="phone number"]',
      'html [aria-label="phone number"]',
      'input[aria-label="phone number"]',
    ]);
  });
});

describe("getSelector", () => {
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
        return qawolf.getSelector(target, 0);
      },
      { element }
    );

    expect(builtSelector).toEqual(expected || selector);
  };

  describe("ancestor cues", () => {
    it.each([
      ["<a><x-child-element /></a>", "a"],
      ["<button><x-child-element /></button>", "button"],
      ['<div role="button"><x-child-element /></div>', '[role="button"]'],
      ['<div role="checkbox"><x-child-element /></div>', '[role="checkbox"]'],
      ['<div role="radio"><x-child-element /></div>', '[role="radio"]'],
      ["<label><x-child-element /></label>", "label"],
    ])("targets the likely ancestor %o", async (body, expected) => {
      await setBody(page, body);
      await expectSelector("x-child-element", expected);
    });

    // eslint-disable-next-line jest/expect-expect
    it("targets the better selector on the descendant despite having likely ancestor", async () => {
      await setBody(page, '<a><div><img id="child"></div></a>');
      await expectSelector("img", "#child");
    });

    // eslint-disable-next-line jest/expect-expect
    it("targets the iframe always despite having likely ancestor", async () => {
      await setBody(page, "<a><iframe></iframe><a>");
      await expectSelector("iframe", "iframe");
    });

    // eslint-disable-next-line jest/expect-expect
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

    // eslint-disable-next-line jest/expect-expect
    it("uses ancestor cues when required", async () => {
      await setBody(page, `<li><input></li><li><input></li>`);
      await expectSelector("li:nth-of-type(2) input");
    });
  });

  describe("descendant cues", () => {
    // eslint-disable-next-line jest/expect-expect
    it("does not pick a descendant across a click boundary", async () => {
      await setBody(page, `<div><button data-qa="hello">hello</button></div>`);
      await expectSelector("div");
    });

    // eslint-disable-next-line jest/expect-expect
    it("picks a descendant with a better selector", async () => {
      await setBody(
        page,
        `<a style="display: flex"><span><svg aria-label="Home"></svg></span></a>`
      );
      await expectSelector("a", '[aria-label="Home"]');
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it("escapes special characters", async () => {
    await setBody(page, `<div id="special:id"></div>`);
    await expectSelector("#special\\:id");
  });

  // eslint-disable-next-line jest/expect-expect
  it("includes :visible modifier when needed", async () => {
    // make the visible element untargetable by nth-of-type
    await setBody(
      page,
      `
<div>
  <div><input style="visibility: hidden"></div>
  <div><input style="visibility: hidden"></div>
</div>
<div>
  <div><input style="visibility: hidden"></div>
  <div><input></div>
</div>`
    );

    await expectSelector("input:visible");
  });

  it("short circuits to cached selector when it matches", async () => {
    // for valid selectors
    await setBody(page, `<div id="parent"><input class="cached"></div>`);

    const result = await page.evaluate(() => {
      const element = document.querySelector("input");
      const cache = new Map<HTMLElement, RankedSelector>();
      cache.set(element, { penalty: 0, selector: ".cached" });
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.getSelector(element, 0, cache);
    });
    expect(result).toEqual(".cached");

    // not for non-matching selectors
    const result2 = await page.evaluate(() => {
      const element = document.querySelector("input");
      const cache = new Map<HTMLElement, RankedSelector>();
      cache.set(element, { penalty: 0, selector: "div" });
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.getSelector(element, 0, cache);
    });
    expect(result2).toEqual("input");
  });

  // eslint-disable-next-line jest/expect-expect
  it("short circuits to html and body", async () => {
    await page.evaluate(() => {
      document.querySelector("html").setAttribute("data-qa", "main");
      document.querySelector("body").setAttribute("data-qa", "container");
    });

    await expectSelector("html");
    await expectSelector("body");
  });

  // eslint-disable-next-line jest/expect-expect
  it("targets label and checkbox input", async () => {
    await setBody(
      page,
      `<input type="checkbox" id="dog" value="dog"><label for="dog">Dog</label>`
    );
    await expectSelector('[for="dog"]');
    await expectSelector('[value="dog"]', "#dog");
  });

  // eslint-disable-next-line jest/expect-expect
  it("always prefers input name over type attribute", async () => {
    await setBody(
      page,
      `<input type="text" class="form-control" name="first_name" value="">
       <input type="text" class="form-control" name="last_name" value="">
       <input type="tel" class="form-control" name="phone1" value="">
       <input type="tel" class="form-control" name="phone2" value="">
       <input type="email" class="form-control" name="email1" value="">
       <input type="email" class="form-control" name="email2" value="">`
    );
    await expectSelector('[name="first_name"]');
    await expectSelector('[name="last_name"]');
    await expectSelector('[name="phone1"]');
    await expectSelector('[name="phone2"]');
    await expectSelector('[name="email1"]');
    await expectSelector('[name="email2"]');
  });

  describe("test attributes", () => {
    // eslint-disable-next-line jest/expect-expect
    it("includes ancestor test attributes", async () => {
      await setBody(
        page,
        `<fieldset data-qa="my-radio-group"><input type="radio" value="cat"></fieldset>`
      );

      await expectSelector('[data-qa="my-radio-group"] [value="cat"]');
    });

    // eslint-disable-next-line jest/expect-expect
    it("prefers test attributes", async () => {
      await setBody(page, `<button data-qa="html-button">Submit</button>`);
      await expectSelector('[data-qa="html-button"]');
    });
  });
});
