import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { launch, setBody } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;

  const fixedSize = "position: fixed; height: 50px; width: 50px;";

  await setBody(
    page,
    `
<div id="parent" style="${fixedSize}">
  <div id="inside">inside</div>
  <div id="outside" style="${fixedSize} left: 500px">outside</div>
</div>
<div id="unrelated" style="${fixedSize}">overlap</div>
<div id="exact-match-overlap" style="${fixedSize} top: 500px">
  <input type="date" style="${fixedSize} top: 500px">
  <textarea style="${fixedSize} top: 500px"></textarea>
</div>
<div id="boundary" style="${fixedSize} left:500px; top: 500px;">
    <div id="same-boundary"></div>
    <button><div>match button</div></button>
</div>
`
  );
});

afterAll(() => browser.close());

describe("isElementMatch", () => {
  const isElementMatch = async (
    elementSelector: string,
    targetSelector: string
  ): Promise<boolean> => {
    return page.evaluate(
      ({ elementSelector, targetSelector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(elementSelector) as HTMLElement;
        const target = document.querySelector(targetSelector) as HTMLElement;
        return qawolf.isElementMatch(element, target, new Map());
      },
      { elementSelector, targetSelector }
    );
  };

  it("returns true if element matches target", async () => {
    expect(await isElementMatch("#parent", "#parent")).toBe(true);
  });

  it("returns true if the middle of the element is inside target", async () => {
    expect(await isElementMatch("#inside", "#parent")).toBe(true);
  });

  it("returns false if the middle of the element is outside target", async () => {
    expect(await isElementMatch("#outside", "#parent")).toBe(false);
  });

  it("return false if middle of the element is inside but not related", async () => {
    expect(await isElementMatch("#unrelated", "#parent")).toBe(false);
  });

  it("return false if element middle overlaps but target requires exact match", async () => {
    expect(
      await isElementMatch("#exact-match-overlap", "input[type=date]")
    ).toBe(false);

    expect(await isElementMatch("#exact-match-overlap", "textarea")).toBe(
      false
    );
  });

  it("return false if element crosses a click boundary", async () => {
    expect(await isElementMatch("#boundary button", "#boundary")).toBe(false);

    expect(await isElementMatch("#boundary button div", "#boundary")).toBe(
      false
    );

    expect(await isElementMatch("#same-boundary", "#boundary")).toBe(true);

    expect(
      await isElementMatch("#boundary button div", "#boundary button")
    ).toBe(true);
  });
});
