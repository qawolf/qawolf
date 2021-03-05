import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { launch } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;

  await page.setContent(`
<html>
<body>
<div id="parent" style="position: absolute; top: 0px; left: 0px;">
  <button id="inside">inside</button>
  <button id="outside" style="position: absolute; left: 300px">outside</button>
</div>
<div id="unrelated" style="position: absolute; top: 0px; left: 0px;">overlap</div>
</body>    
</html>`);
});

afterAll(() => browser.close());

describe("isMatch", () => {
  const isMatch = async (
    elementSelector: string,
    targetSelector: string
  ): Promise<boolean> => {
    return page.evaluate(
      ({ elementSelector, targetSelector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(elementSelector) as HTMLElement;
        const target = document.querySelector(targetSelector) as HTMLElement;
        return qawolf.isMatch(element, target, new Map());
      },
      { elementSelector, targetSelector }
    );
  };

  it("returns true if element matches target", async () => {
    const result = await isMatch("#parent", "#parent");
    expect(result).toBe(true);
  });

  it("returns true if element is inside target", async () => {
    const result = await isMatch("#parent", "#inside");
    expect(result).toBe(true);
  });

  it("returns false if element is outside target", async () => {
    const result = await isMatch("#parent", "#outside");
    expect(result).toBe(false);
  });

  it("return false if element is inside but not related", async () => {
    const result = await isMatch("#unrelated", "#parent");
    expect(result).toBe(false);
  });
});
