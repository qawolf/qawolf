import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("getDataValue", () => {
  it("returns null if data attribute not specified in config", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, null);
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  it("returns null if element does not have specified data attribute", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-other", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-other");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  it("returns data attribute value correctly", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBe("user");
  });
});

describe("getDescriptor", () => {
  it("correctly returns full element element", async () => {
    const inputDescriptor = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDescriptor(
        document.getElementsByTagName("input")[0],
        "data-qa"
      );

      username.removeAttribute("data-qa");

      return result;
    });

    expect(inputDescriptor).toMatchObject({
      ariaLabel: null,
      classList: null,
      dataValue: "user",
      href: null,
      iconContent: null,
      id: "username",
      innerText: null,
      inputType: "text",
      labels: ["username"],
      name: "username",
      placeholder: null,
      tagName: "input",
      title: null
    });
    expect(inputDescriptor!.parentText).toContain("username");

    const headerDescriptor = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const h2 = document.getElementsByTagName("h2")[0]!;
      h2.setAttribute("aria-label", "header");

      return qawolf.element.getDescriptor(
        document.getElementsByTagName("h2")[0],
        "data-qa"
      );
    });

    expect(headerDescriptor).toMatchObject({
      ariaLabel: "header",
      classList: null,
      dataValue: null,
      href: null,
      iconContent: null,
      id: null,
      innerText: "login page",
      inputType: null,
      labels: null,
      name: null,
      placeholder: null,
      tagName: "h2",
      title: null
    });
    expect(headerDescriptor!.parentText).toContain("login page");

    const buttonDescriptor = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementsByTagName("button")[0]!;
      button.setAttribute("title", "some-title");

      return qawolf.element.getDescriptor(
        document.getElementsByTagName("button")[0],
        null
      );
    });

    expect(buttonDescriptor).toMatchObject({
      ariaLabel: null,
      classList: ["radius"],
      iconContent: ["fa", "fa-2x", "fa-sign-in"],
      innerText: "login",
      inputType: "submit",
      tagName: "button",
      title: "some-title"
    });
  });
});

describe("getIconContent", () => {
  it("returns icon content on i tag", async () => {
    const iconContent = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getIconContent(
        document.getElementsByTagName("i")[0]
      );
    });

    expect(iconContent).toEqual(["fa", "fa-2x", "fa-sign-in"]);
  });

  it("returns child icon content", async () => {
    const iconContent = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getIconContent(
        document.getElementsByTagName("button")[0]
      );
    });

    expect(iconContent).toEqual(["fa", "fa-2x", "fa-sign-in"]);
  });

  it("returns null if no icon content", async () => {
    const iconContent = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getIconContent(
        document.getElementsByTagName("input")[0]
      );
    });

    expect(iconContent).toBeNull();
  });
});

describe("getLabels", () => {
  it("correctly returns labels", async () => {
    const nullLabels = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getLabels(document.getElementsByTagName("h2")[0]);
    });

    expect(nullLabels).toBeNull();

    const usernameLabels = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getLabels(
        document.getElementsByTagName("input")[0]
      );
    });

    expect(usernameLabels).toEqual(["username"]);
  });
});

describe("getParentText", () => {
  it("correctly returns parent text", async () => {
    const iconParentText = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getParentText(
        document.getElementsByTagName("i")[0]
      );
    });

    expect(iconParentText).toEqual(["login", "login"]);
  });
});

describe("getPlaceholder", () => {
  it("returns placeholder if present", async () => {
    const placeholder = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const input = document.getElementsByTagName("input")[0];
      input.placeholder = "enter username";

      const result = qawolf.element.getPlaceholder(
        document.getElementsByTagName("input")[0]
      );

      input.removeAttribute("placeholder");

      return result;
    });

    expect(placeholder).toBe("enter username");
  });

  it("returns null if no placeholder", async () => {
    const nullPlaceholder = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getPlaceholder(
        document.getElementsByTagName("input")[0]
      );
    });

    expect(nullPlaceholder).toBeNull();
  });

  it("returns disabled option text for select", async () => {
    await page.goto(`${CONFIG.testUrl}dropdown`);

    const placeholder = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getPlaceholder(
        document.getElementsByTagName("select")[0]
      );
    });

    expect(placeholder).toBe("please select an option");

    await page.goto(`${CONFIG.testUrl}login`);
  });
});

describe("getTextContent", () => {
  it("returns text content", async () => {
    const headerTextContent = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getTextContent(
        document.getElementsByTagName("h2")[0]
      );
    });

    expect(headerTextContent).toBe("login page");

    const nullTextContent = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.element.getTextContent(
        document.getElementsByTagName("input")[0]
      );
    });

    expect(nullTextContent).toBeNull();
  });
});
