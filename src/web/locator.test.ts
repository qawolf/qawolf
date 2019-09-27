import { Page } from "puppeteer";
import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create(`${CONFIG.testUrl}/login`);
  page = await browser.currentPage();
});

afterAll(() => browser.close());

test("getLabels correctly returns labels", async () => {
  const nullLabels = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getLabels(document.getElementsByTagName("h2")[0]);
  });

  expect(nullLabels).toBeNull();

  const usernameLabels = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getLabels(document.getElementsByTagName("input")[0]);
  });

  expect(usernameLabels).toEqual(["username"]);
});

test("getParentText correctly returns parent text", async () => {
  const iconParentText = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getParentText(document.getElementsByTagName("i")[0]);
  });

  expect(iconParentText).toEqual([" login", " login"]);
});

test("getPlaceholder correctly returns placeholder", async () => {
  const nullPlaceholder = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getPlaceholder(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(nullPlaceholder).toBeNull();
});

test("getTextContent correctly returns text content", async () => {
  const headerTextContent = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getTextContent(
      document.getElementsByTagName("h2")[0]
    );
  });

  expect(headerTextContent).toBe("login page");

  const nullTextContent = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getTextContent(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(nullTextContent).toBeNull();
});

test("getLocator correctly returns full element locator", async () => {
  const inputLocator = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return qawolf.locator.getLocator(document.getElementsByTagName("input")[0]);
  });

  expect(inputLocator).toMatchObject({
    classList: null,
    href: null,
    id: "username",
    inputType: "text",
    labels: ["username"],
    name: "username",
    placeholder: null,
    tagName: "input",
    textContent: null
  });
  expect(inputLocator!.parentText).toContain("username");

  const headerLocator = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.locator.getLocator(document.getElementsByTagName("h2")[0]);
  });

  expect(headerLocator).toMatchObject({
    classList: null,
    href: null,
    id: null,
    inputType: null,
    labels: null,
    name: null,
    placeholder: null,
    tagName: "h2",
    textContent: "login page"
  });
  expect(headerLocator!.parentText).toContain("login page");
});
