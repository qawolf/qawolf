import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";
import { sleep } from "../utils";

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
    return Promise.resolve(qawolf.actions.scrollTo(1000, 1000));
  });

  const nextYPosition = await page.evaluate(() => window.pageYOffset);
  expect(nextYPosition).toBe(1000);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return Promise.resolve(qawolf.actions.scrollTo(0, 1000));
  });

  const finalYPosition = await page.evaluate(() => window.pageYOffset);
  expect(finalYPosition).toBe(0);
});

test("actions.setInputValue sets an input value", async () => {
  const page = await browser.goto(`${CONFIG.testUrl}/login`);

  await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    const username = qawolf.xpath.findElementByXpath(
      '//*[@id="username"]'
    ) as HTMLInputElement;
    qawolf.actions.setInputValue(username, "spirit");
  });

  const [username, password] = await page.$$eval(
    "input",
    (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
  );

  expect(username).toBe("spirit");
  expect(password).toBeFalsy();
});
