import { Page } from "playwright";

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

async function getChooserStyle() {
  const chooser = await page.$("#qawolf-chooser");

  const style = await chooser.evaluate((element) => {
    const {
      background,
      display,
      height,
      left,
      top,
      visibility,
      width,
    } = element.style;

    const paw = element.querySelector("svg");

    return {
      background,
      display,
      height,
      left,
      pawVisibility: paw.style.visibility,
      top,
      visibility,
      width,
    };
  });

  return style;
}

it("highlights an element while hovered", async () => {
  await page.hover("input");

  expect(await getChooserStyle()).toEqual({
    background: "rgba(15, 120, 243, 0.15)",
    display: "flex",
    height: "21px",
    left: "8px",
    pawVisibility: "hidden",
    top: "8px",
    visibility: "visible",
    width: "153px",
  });
});

it("chooses an element on click", async () => {
  await page.click("select");

  expect(await getChooserStyle()).toMatchObject({
    background: "rgba(15, 120, 243, 0.15)",
  });

  await page.waitForTimeout(0);

  expect(chosen).toEqual({
    isFillable: false,
    selectors: [
      "select",
      "body select",
      "html select",
      "select:visible",
      "body select:visible",
      "html select:visible",
    ],
    text: "a",
  });

  const paw = await page.$("#qawolf-chooser > svg");
  expect(await paw.evaluate((el) => el.style.visibility)).toEqual("visible");
});

it("stop hides the chooser and start shows it again", async () => {
  await page.click("select");
  expect(await getChooserStyle()).toMatchObject({
    pawVisibility: "visible",
    visibility: "visible",
  });

  await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    qawolf.elementChooser.stop();
  });
  expect(await getChooserStyle()).toMatchObject({
    pawVisibility: "hidden",
    visibility: "hidden",
  });

  await page.evaluate(() => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    qawolf.elementChooser.start();
  });

  await page.hover("select");
  expect(await getChooserStyle()).toMatchObject({
    pawVisibility: "hidden",
    visibility: "visible",
  });
});

it("updates text when the value changes", async () => {
  await page.click("input");
  await page.waitForTimeout(100);
  expect(chosen).toMatchObject({ text: "123" });

  await page.fill("input", "999");
  await page.waitForTimeout(100);
  expect(chosen).toMatchObject({ text: "999" });
});
