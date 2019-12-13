import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";
import { findText } from "../../src/find/findText";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}/checkboxes` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("findText", () => {
  it("finds the element with the least extra text", async () => {
    let element = await findText(page, { text: "Checkbox" });
    expect(await getXpath(element)).toEqual("//*[@id='content']/div/h3");

    element = await findText(page, { text: "checkbox 1" });
    expect(await getXpath(element)).toEqual("//*[@id='checkboxes']");
  });

  it("does not find an element with the incorrect case", async () => {
    let message = false;

    try {
      await findText(page, { text: "checkboxes" });
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
  });
});
