import { Page } from "puppeteer";
import { createPage } from "../browser/browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let page: Page;

beforeAll(async () => {
  page = await createPage();
});

afterAll(() => page.browser().close());

test("actions.click works on a link", async () => {
  await page.goto(CONFIG.testUrl);

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

test("actions.setInputValue sets an input value", async () => {
  await page.goto(`${CONFIG.testUrl}/login`);

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
