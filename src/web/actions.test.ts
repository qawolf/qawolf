import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
});

afterAll(() => browser.close());

test("actions.click works on a link", async () => {
  await browser._browser!.url(CONFIG.testUrl);
  await browser.injectSdk();

  await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    const link = qawolf.xpath.findElementByXpath(
      '//*[@id="content"]/ul/li[3]/a'
    );
    qawolf.actions.click(link!);
  });

  const url = await browser._browser!.getUrl();

  expect(url).toBe(`${CONFIG.testUrl}/broken_images`);
});

test("actions.setInputValue sets an input value", async () => {
  await browser._browser!.url(`${CONFIG.testUrl}/login`);
  await browser.injectSdk();

  await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    const username = qawolf.xpath.findElementByXpath(
      '//*[@id="username"]'
    ) as HTMLInputElement;
    qawolf.actions.setInputValue(username, "spirit");
  });

  const inputs = await browser._browser!.$$("input");
  const username = await inputs[0].getValue();
  const password = await inputs[1].getValue();

  expect(username).toBe("spirit");
  expect(password).toBeFalsy();
});
