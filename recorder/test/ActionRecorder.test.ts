import { Page } from "playwright";
import waitForExpect from "wait-for-expect";

import { launch, LaunchResult } from "./utils";
import { Action, ElementAction } from "../src/types";

let actions: ElementAction[] = [];
let launched: LaunchResult;

const getFreshPage = async (): Promise<Page> => {
  const page = await launched.context.newPage();
  await page.goto(
    "file://" + require.resolve("./fixtures/ActionRecorder.html")
  );
  return page;
};

const actionsOfType = (type: Action): ElementAction[] => {
  return actions.filter((action) => action.action === type);
};

beforeAll(async () => {
  launched = await launch({ startRecorder: true });

  await launched.context.exposeBinding(
    "qawElementAction",
    (_: Record<string, any>, elementAction: ElementAction) => {
      actions.push(elementAction);
    }
  );
});

afterAll(() => launched.browser.close());

beforeEach(() => {
  actions = [];
});

it("records click actions", async () => {
  const page = await getFreshPage();
  await page.click(".textInput");
  await page.click("body");
  await waitForExpect(() => {
    expect(actionsOfType("click").length).toBe(2);
  }, 10000);
  await page.close();

  expect(actionsOfType("click").map((action) => action.selector)).toEqual([
    '[type="text"]',
    "body",
  ]);
});

it("records click for hiding target", async () => {
  const page = await getFreshPage();
  await page.click("#hide-me");
  await waitForExpect(() => {
    expect(actionsOfType("click").length).toBe(1);
  }, 10000);
  await page.close();

  expect(actionsOfType("click").map((action) => action.selector)).toEqual([
    "#hide-me",
  ]);
});

it("records fill actions when typing", async () => {
  const page = await getFreshPage();

  await page.type(".textInput", "sup");
  await page.keyboard.press("Tab");
  await page.type("body", "yo");

  await waitForExpect(() => {
    expect(actionsOfType("fill")).toHaveLength(4);
  }, 10000);

  await page.close();

  expect(actionsOfType("fill").map((a) => a.value)).toEqual([
    "s",
    "su",
    "sup", // input
    "sup", // change
  ]);
});

// Playwright is unable to do selectOption such that it
// isTrusted will be true, so there is currently no way for
// this test to pass. Leaving it here in case Playwright
// fixes this eventually.
// eslint-disable-next-line jest/no-disabled-tests
it.skip("records selectOption actions", async () => {
  const page = await getFreshPage();

  await page.selectOption(".selectInput", "one");

  await waitForExpect(() => {
    expect(actionsOfType("selectOption").length).toBe(1);
  }, 30000);

  await page.close();

  const [action] = actionsOfType("selectOption");
  expect(action.selector).toBe(".selectInput");
  expect(action.value).toBe("one");
});

it("records keyboard.press actions", async () => {
  const page = await getFreshPage();

  await page.keyboard.press("Escape");

  await waitForExpect(() => {
    expect(actionsOfType("keyboard.press").length).toBe(1);
  }, 10000);

  await page.close();

  expect(actionsOfType("keyboard.press").map((action) => action.value))
    .toMatchInlineSnapshot(`
    Array [
      "Escape",
    ]
  `);
});

it("stop and start work", async () => {
  const page = await getFreshPage();

  await page.evaluate(() => {
    (window as any).qawInstance.stop();
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  expect(actionsOfType("press").length).toEqual(0);

  await page.evaluate(() => {
    (window as any).qawInstance.start();
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  expect(actionsOfType("keyboard.press").length).toEqual(1);

  await page.close();
});
