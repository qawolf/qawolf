import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
  await browser._browser!.url(`${CONFIG.testUrl}/login`);
  await browser.injectSdk();
});

afterAll(() => browser.close());

test("selector.getLabels correctly returns labels", async () => {
  const nullLabels = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getLabels(document.getElementsByTagName("h2")[0]);
  });

  expect(nullLabels).toBeNull();

  const usernameLabels = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getLabels(document.getElementsByTagName("input")[0]);
  });

  expect(usernameLabels).toEqual(["username"]);
});

test("selector.getParentText correctly returns parent text", async () => {
  const iconParentText = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getParentText(document.getElementsByTagName("i")[0]);
  });

  expect(iconParentText).toEqual([" login", " login"]);
});

test("selector.getPlaceholder correctly returns placeholder", async () => {
  const nullPlaceholder = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getPlaceholder(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(nullPlaceholder).toBeNull();
});

test("selector.getTextContent correctly returns text content", async () => {
  const headerTextContent = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getTextContent(
      document.getElementsByTagName("h2")[0]
    );
  });

  expect(headerTextContent).toBe("login page");

  const nullTextContent = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getTextContent(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(nullTextContent).toBeNull();
});

test("selector.getSelector correctly returns full element selector", async () => {
  const inputSelector = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getSelector(
      document.getElementsByTagName("input")[0]
    );
  });

  expect(inputSelector).toMatchObject({
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
  expect(inputSelector!.parentText).toContain("username");

  const headerSelector = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;

    return qawolf.selector.getSelector(document.getElementsByTagName("h2")[0]);
  });

  expect(headerSelector).toMatchObject({
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
  expect(headerSelector!.parentText).toContain("login page");
});
