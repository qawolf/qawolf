import { Page } from "playwright";
import waitForExpect from "wait-for-expect";

import { launch, LaunchResult, serveFixtures, stopServeFixtures } from "./utils";
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
  await serveFixtures();

  launched = await launch();

  await launched.context.exposeBinding(
    "qawElementAction",
    (_: Record<string, any>, elementAction: ElementAction) => {
      actions.push(elementAction);
    }
  );
});

afterAll(async () => {
  await stopServeFixtures();
  await launched.browser.close()
});

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

it("record only one click for PointerEvent clicks", async () => {
  const page = await launched.context.newPage();
  await page.goto("http://localhost:9876/grommet");

  await page.click("text=interested?");

  await waitForExpect(() => {
    expect(actionsOfType("click").length).toBe(1);
  }, 10000);
  await page.close();

  expect(actionsOfType("click").map((action) => action.selector)).toEqual([
    "text=interested?",
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

it("records selectOption actions", async () => {
  const page = await getFreshPage();

  // Playwright is unable to do selectOption such that isTrusted will be true
  // so allow untrusted events for this test
  await page.evaluate(() =>
    (window as any).qawolf._setAllowUntrustedEvents(true)
  );

  await page.selectOption("select", "one");

  await waitForExpect(() => {
    expect(actionsOfType("selectOption").length).toBe(1);
  }, 30000);

  await page.close();

  const [action] = actionsOfType("selectOption");
  expect(["select", "text=One"]).toContain(action.selector);
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
    (window as any).qawolf.actionRecorder.stop();
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  expect(actionsOfType("press").length).toEqual(0);

  await page.evaluate(() => {
    (window as any).qawolf.actionRecorder.start();
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  expect(actionsOfType("keyboard.press").length).toEqual(1);

  await page.close();
});
