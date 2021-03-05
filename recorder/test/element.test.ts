import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import { launch } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;
});

afterAll(() => browser.close());

describe("getDescriptor", () => {
  const getDescriptor = async (selector: string): Promise<ElementDescriptor> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLInputElement;
        return qawolf.getDescriptor(target);
      },
      { selector }
    );

  beforeAll(() =>
    page.setContent(`
<html>
<body>
<input type="text">
<h1 contenteditable="true"></h1>
</body>    
</html>`)
  );

  it("gets a descriptor for an element", async () => {
    expect(await getDescriptor("input")).toEqual({
      inputType: "text",
      isContentEditable: false,
      isInput: true,
      tag: "input",
    });

    expect(await getDescriptor("h1")).toEqual({
      isContentEditable: true,
      isInput: false,
      tag: "h1",
    });
  });
});

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

describe("getXpath", () => {
  const getXpath = async (selector: string): Promise<string> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLInputElement;
        return qawolf.getXpath(target);
      },
      { selector }
    );

  beforeAll(() =>
    page.setContent(`<html><body><div><span></span></div></body></html>`)
  );

  it("gets an xpath", async () => {
    expect(await getXpath("span")).toEqual("/html/body/div/span");
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
