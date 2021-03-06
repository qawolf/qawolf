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
  <button id="inside">inside</button>
  <button id="outside" style="${fixedSize} left: 500px">outside</button>
</div>
<div id="unrelated" style="${fixedSize}">overlap</div>
<div id="exact-match-overlap" style="${fixedSize} top: 500px">
  <input type="date" style="${fixedSize} top: 500px">
  <textarea style="${fixedSize} top: 500px" />
</div>
`
  );
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
    expect(await isMatch("#parent", "#parent")).toBe(true);
  });

  it("returns true if the middle of the element is inside target", async () => {
    expect(await isMatch("#inside", "#parent")).toBe(true);
  });

  it("returns false if the middle of the element is outside target", async () => {
    expect(await isMatch("#outside", "#parent")).toBe(false);
  });

  it("return false if middle of the element is inside but not related", async () => {
    expect(await isMatch("#unrelated", "#parent")).toBe(false);
  });

  it("return false if element middle overlaps but target requires exact match", async () => {
    expect(await isMatch("#exact-match-overlap", "input[type=date]")).toBe(
      false
    );

    expect(await isMatch("#exact-match-overlap", "textarea")).toBe(false);
  });
});
