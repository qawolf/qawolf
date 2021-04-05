import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { launch, setBody } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;
});

afterAll(() => browser.close());

describe("hasCommonAncestor", () => {
  beforeAll(async () => {
    await setBody(
      page,
      `
  <div id="top">
    <div id="1">
      <div id="2">
        <div id="3">
          <div id="4">
            <div id="5" />
          </div>
        </div>
      </div>
    </div>
    <div id="6" />
  </div>`
    );
  });

  const hasCommonAncestor = async (
    elementId: string,
    otherId: string
  ): Promise<boolean> => {
    return page.evaluate(
      ({ elementId, otherId }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.getElementById(elementId) as HTMLElement;
        const target = document.getElementById(otherId) as HTMLElement;
        return qawolf.hasCommonAncestor(element, target);
      },
      { elementId, otherId }
    );
  };

  it("returns false if no common ancestor within max levels", async () => {
    expect(await hasCommonAncestor("5", "6")).toBe(false);
  });

  it("returns true if element is a descendant or ancestor", async () => {
    expect(await hasCommonAncestor("top", "5")).toBe(true);
    expect(await hasCommonAncestor("5", "top")).toBe(true);
  });

  it("returns true if the common ancestor within max levels", async () => {
    expect(await hasCommonAncestor("6", "1")).toBe(true);
    expect(await hasCommonAncestor("6", "2")).toBe(true);
    expect(await hasCommonAncestor("6", "3")).toBe(true);
    expect(await hasCommonAncestor("6", "4")).toBe(true);
  });
});

describe("isElementMatch", () => {
  beforeAll(async () => {
    const fixedSize = "position: fixed; height: 50px; width: 50px;";

    await setBody(
      page,
      `
  <div id="parent" style="${fixedSize}">
    <div id="inside">inside</div>
    <div id="outside" style="${fixedSize} left: 500px">outside</div>
  </div>
  <div>
    <div>
      <div>
        <div id="unrelated" style="${fixedSize}">overlap</div>
      </div>
    </div>
  </div>
  <div id="exact-match-overlap" style="${fixedSize} top: 500px">
    <input type="date" style="${fixedSize} top: 500px">
    <textarea style="${fixedSize} top: 500px"></textarea>
    <iframe style="${fixedSize} top: 500px"></iframe>
  </div>
  <div id="boundary" style="${fixedSize} left:500px; top: 500px;">
      <div id="same-boundary"></div>
      <button><div>match button</div></button>
  </div>
  `
    );
  });

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

    expect(await isElementMatch("#exact-match-overlap", "iframe")).toBe(false);
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
