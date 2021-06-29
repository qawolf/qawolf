import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import { launch, setBody } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;
});

afterAll(() => browser.close());

describe("getAssertText", () => {
  const getAssertText = async (selector: string): Promise<string> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLInputElement;
        return qawolf.getAssertText(target);
      },
      { selector }
    );

  beforeAll(() =>
    setBody(
      page,
      `<input value="123"><div>howdy. how are you?</div><span>""quoted"" 'text' \`allowed\`</span>`
    )
  );

  it("gets the input's value", async () => {
    expect(await getAssertText("input")).toEqual("123");
  });

  it("gets the element's inner text", async () => {
    expect(await getAssertText("div")).toEqual("howdy. how are you?");

    expect(await getAssertText("span")).toEqual(
      `""quoted"" 'text' \`allowed\``
    );
  });
});

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
    setBody(page, '<input type="text"><input type="checkbox" id="checked" checked><input type="checkbox" id="cleared"><h1 contenteditable="true"></h1>')
  );

  it("gets a descriptor for an element", async () => {
    expect(await getDescriptor("input[type=text]")).toEqual({
      inputIsChecked: false,
      inputType: "text",
      isContentEditable: false,
      tag: "input",
    });

    expect(await getDescriptor("input#checked")).toEqual({
      inputIsChecked: true,
      inputType: "checkbox",
      isContentEditable: false,
      tag: "input",
    });

    expect(await getDescriptor("input#cleared")).toEqual({
      inputIsChecked: false,
      inputType: "checkbox",
      isContentEditable: false,
      tag: "input",
    });

    expect(await getDescriptor("h1")).toEqual({
      isContentEditable: true,
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
    setBody(
      page,
      `<input type="text" value="text value">
<h1 contenteditable="true">Edit me!</h1>
<input contenteditable="true" value="my value" />
<input id="empty">`
    )
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
    setBody(
      page,
      `
<div id="1">
  <div contenteditable="true" id="2">
    <div contenteditable="true" id="3"></div>
  </div>
</div>`
    )
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

  beforeAll(() => setBody(page, `<div><span></span></div>`));

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
    setBody(
      page,
      `
<span id="visible">visible</span>
<div id="empty"></div>
<div id="display-none" style="display: none">not displayed</div>`
    )
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
