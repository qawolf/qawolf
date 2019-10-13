import { Browser } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { QAWolf } from "../src/index";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("getDataValue", () => {
  test("returns null if data attribute not specified in config", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, null);
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  test("returns null if element does not have specified data attribute", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-other", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-other");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  test("returns data attribute value correctly", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBe("user");
  });
});

test("getLabels correctly returns labels", async () => {
  const nullLabels = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getLabels(document.getElementsByTagName("h2")[0]);
  });

  expect(nullLabels).toBeNull();

  const usernameLabels = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getLabels(document.getElementsByTagName("input")[0]);
  });

  expect(usernameLabels).toEqual(["username"]);
});

test("getParentText correctly returns parent text", async () => {
  const iconParentText = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getParentText(document.getElementsByTagName("i")[0]);
  });

  expect(iconParentText).toEqual(["login", "login"]);
});

describe("getPlaceholder", () => {
  test("returns placeholder if present", async () => {
    const placeholder = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
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

  test("returns null if no placeholder", async () => {
    const nullPlaceholder = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.element.getPlaceholder(
        document.getElementsByTagName("input")[0]
      );
    });

    expect(nullPlaceholder).toBeNull();
  });

  test("returns disabled option text for select", async () => {
    await page.goto(`${CONFIG.testUrl}dropdown`);

    const placeholder = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.element.getPlaceholder(
        document.getElementsByTagName("select")[0]
      );
    });

    expect(placeholder).toBe("please select an option");

    await page.goto(`${CONFIG.testUrl}login`);
  });
});

test("getTextContent returns text content", async () => {
  const headerTextContent = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getTextContent(
      document.getElementsByTagName("h2")[0]
    );
  });

  expect(headerTextContent).toBe("login page");

  const nullTextContent = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getTextContent(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(nullTextContent).toBeNull();
});

test("getDescriptor correctly returns full element element", async () => {
  const inputDescriptor = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

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
    classList: null,
    dataValue: "user",
    href: null,
    id: "username",
    inputType: "text",
    labels: ["username"],
    name: "username",
    placeholder: null,
    tagName: "input",
    textContent: null
  });
  expect(inputDescriptor!.parentText).toContain("username");

  const headerDescriptor = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.element.getDescriptor(
      document.getElementsByTagName("h2")[0],
      "data-qa"
    );
  });

  expect(headerDescriptor).toMatchObject({
    classList: null,
    dataValue: null,
    href: null,
    id: null,
    inputType: null,
    labels: null,
    name: null,
    placeholder: null,
    tagName: "h2",
    textContent: "login page"
  });
  expect(headerDescriptor!.parentText).toContain("login page");
});
