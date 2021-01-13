import { Browser, BrowserContext, Page } from "playwright";
import waitForExpect from "wait-for-expect";
import { launch } from "./utils";
import { Action, ElementAction } from "../src/types";

let actions: ElementAction[] = [];

let browser: Browser;
let context: BrowserContext;

const getFreshPage = async (): Promise<Page> => {
  const page: Page = await context.newPage();
  await page.goto("file://" + require.resolve("./ActionRecorderTestPage.html"));
  return page;
};

const actionsOfType = (type: Action): ElementAction[] => {
  return actions.filter((action) => action.action === type);
};

beforeAll(async () => {
  browser = await launch({
    startRecorder: true,
  });
  context = await browser.newContext();
  await context.exposeBinding(
    "qawElementAction",
    (_: Record<string, any>, elementAction: ElementAction) => {
      actions.push(elementAction);
    }
  );
});

afterAll(() => browser.close());

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

  expect(actionsOfType("click").map((action) => action.selector))
    .toMatchInlineSnapshot(`
    Array [
      ".textInput",
      "body",
    ]
  `);
});

it("records fill actions when typing", async () => {
  const page = await getFreshPage();

  await page.type(".textInput", "sup");
  await page.keyboard.press("Tab");
  await page.type("body", "yo");

  await waitForExpect(() => {
    expect(actionsOfType("fill").length).toBe(1);
  }, 10000);

  await page.close();

  expect(actionsOfType("fill").map((action) => action.value))
    .toMatchInlineSnapshot(`
    Array [
      "sup",
    ]
  `);
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

it("records press actions", async () => {
  const page = await getFreshPage();

  await page.keyboard.press("Escape");

  await waitForExpect(() => {
    expect(actionsOfType("press").length).toBe(1);
  }, 10000);

  await page.close();

  expect(actionsOfType("press").map((action) => action.value))
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

  await page.evaluate(() => {
    (window as any).qawInstance.start();
  });
  await page.keyboard.press("Escape");

  let failed = false;
  try {
    await waitForExpect(() => {
      expect(actionsOfType("press").length).toBe(2);
    }, 10000);
    failed = true;
  } catch (error) {
    // Throwing is what we want because we expect the second press
    // to never come through.
  }

  expect(failed).toBe(false);

  await page.close();
});
