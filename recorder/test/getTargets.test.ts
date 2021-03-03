import { Browser, BrowserContext, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { launch } from "./utils";

let browser: Browser;
let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  context = await browser.newContext();
  page = await context.newPage();

  // workaround since we need to navigate for init script
  await page.goto("file://" + require.resolve("./ActionRecorderTestPage.html"));

  await page.setContent(`
  <html>
  <body>
    <button>
      <div>
        <span>inner</span>
      </div><
    /button>
    <button data-test="nested-svg">
      <svg>
        <circle></circle>
      </svg>
      <div>
        <span>Nested SVG text button</span>
      </div>
    </button>
  </body>
  <button data-test="nested-link">
    <a>
      <span>nested link</span>
    </a>
  </button>
  <h1></h1>
</html>`);
});

afterAll(() => browser.close());

const getTargets = async (
  selector: string,
  isClick = true
): Promise<string[]> =>
  page.evaluate(
    ({ isClick, selector }) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(selector) as HTMLElement;
      return qawolf
        .getTargets(target, isClick)
        .map((target) => target.tagName.toLowerCase());
    },
    { isClick, selector }
  );

it("gets clickable targets", async () => {
  expect(await getTargets("span")).toMatchInlineSnapshot(`
      Array [
        "button",
        "div",
        "span",
      ]
    `);
});

it("gets all elements when target is the topmost element in group", async () => {
  expect(await getTargets("button")).toMatchInlineSnapshot(`
      Array [
        "button",
        "div",
        "span",
      ]
    `);
});

it("gets sibling elements but not svg descendants", async () => {
  expect(await getTargets('[data-test="nested-svg"] > svg > circle'))
    .toMatchInlineSnapshot(`
      Array [
        "button",
        "svg",
        "div",
        "span",
      ]
    `);
});

it("omits nested click targets", async () => {
  expect(await getTargets('[data-test="nested-link"]')).toMatchInlineSnapshot(`
      Array [
        "button",
      ]
    `);
});

it("works on nested click targets", async () => {
  expect(await getTargets('[data-test="nested-link"] a'))
    .toMatchInlineSnapshot(`
      Array [
        "a",
        "span",
      ]
    `);
});

it("returns the target if there are no descendants", async () => {
  expect(await getTargets("h1")).toMatchInlineSnapshot(`
    Array [
      "h1",
    ]
  `);
});
