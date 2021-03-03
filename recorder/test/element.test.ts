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
});

afterAll(() => browser.close());

describe("getInputElementValue", () => {
  const getInputElementValue = async (selector: string): Promise<string> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLInputElement;
        return qawolf.getInputElementValue(target);
      },
      { selector }
    );

  beforeAll(() =>
    page.setContent(`
<html>
<body>
  <input type="text" value="text value">
  <h1 contenteditable="true">Edit me!</h1>
  <input contenteditable="true" value="my value" />
  <input id="empty">
</body>    
</html>`)
  );

  it("gets value from text input", async () => {
    expect(await getInputElementValue("input")).toEqual("text value");
  });

  it("gets value from contenteditable element", async () => {
    expect(await getInputElementValue('[contenteditable="true"]')).toEqual(
      "Edit me!"
    );
  });

  it("gets value from input element that also has contenteditable attribute", async () => {
    expect(await getInputElementValue('input[contenteditable="true"]')).toEqual(
      "my value"
    );
  });

  it("gets empty string value when field is empty", async () => {
    expect(await getInputElementValue("#empty")).toBe("");
  });
});

describe("getTopmostEditableElement", () => {
  const getTopmostEditableElementId = async (id: string): Promise<string> =>
    page.evaluate(
      ({ id }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById(id) as HTMLInputElement;
        const element = qawolf.getTopmostEditableElement(target);
        return element.id;
      },
      { id }
    );

  beforeAll(() =>
    page.setContent(`
<html>
<body>
<div id="1">
  <div contenteditable="true" id="2">
    <div contenteditable="true" id="3"></div>
  </div>
</div>
</body>    
</html>`)
  );

  it("chooses the topmost isContentEditable ancestor", async () => {
    expect(await getTopmostEditableElementId("3")).toEqual("2");
  });

  it("chooses the original element when its parent is not isContentEditable", async () => {
    expect(await getTopmostEditableElementId("2")).toEqual("2");
  });

  it("chooses the original element when it is not isContentEditable", async () => {
    expect(await getTopmostEditableElementId("1")).toEqual("1");
  });
});

describe("isVisible", () => {
  const isVisible = async (selector: string): Promise<boolean> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLInputElement;
        return qawolf.isVisible(target);
      },
      { selector }
    );

  beforeAll(() =>
    page.setContent(`
<html>
<body>
  <span id="visible">visible</span>
  <div id="empty"></div>
  <div id="display-none" style="display: none">not displayed</div>
</body>    
</html>`)
  );

  it("returns true if element is visible", async () => {
    expect(await isVisible("#visible")).toBe(true);
  });

  it("returns false if element has no width", async () => {
    expect(await isVisible("#empty")).toBe(false);
  });

  it("returns false if element is display:none", async () => {
    expect(await isVisible("#display-none")).toBe(false);
  });
});
