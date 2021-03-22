import { Page } from "playwright";
import waitForExpect from "wait-for-expect";

import { launch, LaunchResult } from "./utils";
import { QAWolfWeb } from "../src";
import { ElementChosen } from "../src/types";

let chosen: ElementChosen;
let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;

  await launched.context.exposeBinding(
    "qawElementChosen",
    (_: Record<string, any>, value: ElementChosen) => {
      chosen = value;
    }
  );
});

beforeEach(async () => {
  await page.goto(
    "file://" + require.resolve("./fixtures/ElementChooser.html")
  );

  await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    qawolf.elementChooser.start();
  });
});

afterAll(() => launched.browser.close());

async function getStyle(selector: string) {
  const element = await page.$(selector);
  return element.evaluate((element) => {
    const style = element.style;
    return {
      background: style.background,
      border: style.border,
      height: style.height,
      left: style.left,
      top: style.top,
      width: style.width,
    };
  });
}

it("chooses an element on click", async () => {
  await page.click("button");

  await waitForExpect(async () => {
    expect(await getStyle("#qawolf-chooser")).toEqual({
      background: "",
      border: "1px solid rgb(15, 120, 243)",
      height: "50px",
      left: "100px",
      top: "0px",
      width: "50px",
    });

    expect(chosen).toMatchObject({
      isFillable: false,
      selectors: expect.arrayContaining(["text=hello", "button"]),
      text: "hello",
    });
  });

  // clears on scroll
  await page.evaluate(() => {
    window.scrollTo(0, 100);
    window.scrollTo(0, 0);
  });

  await waitForExpect(async () => {
    expect(await getStyle("#qawolf-chooser")).toMatchObject({
      height: "0px",
      width: "0px",
    });
  });
});

it("highlights an element while hovered", async () => {
  await page.hover("input");

  expect(await getStyle("#qawolf-highlight")).toEqual({
    background: expect.stringContaining("rgba(15, 120, 243, 0.15)"),
    border: "",
    height: "50px",
    left: "0px",
    top: "0px",
    width: "50px",
  });

  // clears on scroll
  await page.evaluate(() => {
    window.scrollTo(0, 100);
    window.scrollTo(0, 0);
  });

  await waitForExpect(async () => {
    expect(await getStyle("#qawolf-highlight")).toMatchObject({
      height: "0px",
      width: "0px",
    });
  });
});

it("start shows the chooser and highlight", async () => {
  await page.click("input");

  await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    qawolf.elementChooser.stop();
    qawolf.elementChooser.start();
  });

  await page.click("button");

  await waitForExpect(async () => {
    expect(await getStyle("#qawolf-chooser")).toMatchObject({
      height: "50px",
      width: "50px",
    });

    expect(await getStyle("#qawolf-highlight")).toMatchObject({
      height: "50px",
      width: "50px",
    });
  });
});

it("stop hides the chooser and highlight", async () => {
  await page.click("button");

  await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    qawolf.elementChooser.stop();
  });

  await waitForExpect(async () => {
    expect(await getStyle("#qawolf-highlight")).toMatchObject({
      height: "0px",
      width: "0px",
    });

    expect(await getStyle("#qawolf-chooser")).toMatchObject({
      height: "0px",
      width: "0px",
    });
  }, 100);
});

it("updates the chosen text when it changes", async () => {
  await page.click("input");

  await waitForExpect(() => {
    expect(chosen).toMatchObject({ text: "123" });
  });

  await page.fill("input", "999");

  await waitForExpect(() => {
    expect(chosen).toMatchObject({ text: "999" });
  });
});
