import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;

beforeAll(async () => {
  browser = await Browser.create();
});

afterAll(() => browser.close());

test("actions.click works on a link", async () => {
  const page = await browser.goto(CONFIG.testUrl);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    const link = qawolf.xpath.findElementByXpath(
      '//*[@id="content"]/ul/li[3]/a'
    );
    qawolf.actions.click(link!);
  });
  await page.waitForNavigation();

  expect(page.url()).toBe(`${CONFIG.testUrl}/broken_images`);
});

test("actions.scrollTo scrolls to a given position", async () => {
  const page = await browser.goto(`${CONFIG.testUrl}/large`);

  const initialYPosition = await page.evaluate(() => window.pageYOffset);
  expect(initialYPosition).toBe(0);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return Promise.resolve(qawolf.actions.scrollTo(1000));
  });

  const nextYPosition = await page.evaluate(() => window.pageYOffset);
  expect(nextYPosition).toBe(1000);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return Promise.resolve(qawolf.actions.scrollTo(0));
  });

  const finalYPosition = await page.evaluate(() => window.pageYOffset);
  expect(finalYPosition).toBe(0);
});

test("actions.scrollTo scrolls in infinite scroll", async () => {
  const page = await browser.goto(`${CONFIG.testUrl}/infinite_scroll`);

  const initialYPosition = await page.evaluate(() => window.pageYOffset);
  expect(initialYPosition).toBe(0);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return Promise.resolve(qawolf.actions.scrollTo(2000));
  });

  const nextYPosition = await page.evaluate(() => window.pageYOffset);
  expect(nextYPosition).toBe(2000);
});

test("actions.setInputValue sets an input value", async () => {
  const page = await browser.goto(`${CONFIG.testUrl}/login`);

  // only resolve after change is triggered
  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    const username = qawolf.xpath.findElementByXpath(
      '//*[@id="username"]'
    ) as HTMLInputElement;

    const promise = new Promise(resolve => {
      username.onchange = resolve;
    });

    qawolf.actions.setInputValue(username, "spirit");

    return promise;
  });

  const [username, password] = await page.$$eval(
    "input",
    (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
  );

  expect(username).toBe("spirit");
  expect(password).toBeFalsy();
});

test("actions.scrollTo throws error if timeout", async () => {
  const page = await browser.goto(`${CONFIG.testUrl}/infinite_scroll`);

  const initialYPosition = await page.evaluate(() => window.pageYOffset);
  expect(initialYPosition).toBe(0);

  const testFn = async () =>
    await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      return Promise.resolve(qawolf.actions.scrollTo(2000, 0));
    });

  await expect(testFn()).rejects.toThrowError();
});
