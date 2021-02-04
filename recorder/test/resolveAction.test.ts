import { Browser, BrowserContext, Page } from "playwright";
import { launch } from "./utils";
import { QAWolfWeb } from "../src";
import { Action, PossibleAction } from "../src/types";

const getFreshPage = async (): Promise<Page> => {
  const page: Page = await context.newPage();
  await page.goto("file://" + require.resolve("./resolveActionTestPage.html"));
  return page;
};

let browser: Browser;
let context: BrowserContext;

beforeAll(async () => {
  browser = await launch();
  context = await browser.newContext();
});

afterAll(() => browser.close());

it("returns undefined for untrusted actions", async () => {
  const page = await getFreshPage();

  const result = await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;

    const mockAction: PossibleAction = {
      action: "click",
      isTrusted: false,
      target: null,
      time: Date.now(),
      value: null,
    };

    return qawolf.resolveAction(mockAction, undefined);
  });

  expect(result).toBe(undefined);
});

it.each<Action>(["fill", "press"])(
  "returns undefined for clicks immediately after %s actions",
  async (previousActionName) => {
    const page = await getFreshPage();

    const result = await page.evaluate(
      ({ previousActionName }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector("body");

        const mockPreviousAction: PossibleAction = {
          action: previousActionName,
          isTrusted: true,
          target,
          time: 10002000,
          value: null,
        };

        const mockAction: PossibleAction = {
          action: "click",
          isTrusted: true,
          target,
          time: 10002040,
          value: null,
        };

        return qawolf.resolveAction(mockAction, mockPreviousAction);
      },
      { previousActionName }
    );

    expect(result).toBe(undefined);
  }
);

it("returns undefined for clicks on selects", async () => {
  const page = await getFreshPage();

  const result = await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    const target = document.querySelector("select");

    const mockAction: PossibleAction = {
      action: "click",
      isTrusted: false,
      target,
      time: Date.now(),
      value: null,
    };

    return qawolf.resolveAction(mockAction, undefined);
  });

  expect(result).toBe(undefined);
});

it("returns 'selectInput' for 'fill' action on a select", async () => {
  const page = await getFreshPage();

  const result = await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    const target = document.querySelector("select");

    const mockAction: PossibleAction = {
      action: "fill",
      isTrusted: true,
      target,
      time: Date.now(),
      value: null,
    };

    return qawolf.resolveAction(mockAction, undefined);
  });

  expect(result).toBe("selectOption");
});

it("returns 'fill' for 'fill' action on an input", async () => {
  const page = await getFreshPage();

  const result = await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    const target = document.querySelector(".textInput") as HTMLInputElement;

    const mockAction: PossibleAction = {
      action: "fill",
      isTrusted: true,
      target,
      time: Date.now(),
      value: qawolf.getInputElementValue(target),
    };

    return qawolf.resolveAction(mockAction, undefined);
  });

  expect(result).toBe("fill");
});
