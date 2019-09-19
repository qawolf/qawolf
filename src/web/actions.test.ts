import Browser from "../Browser";
import { QAWolf, QAWolfWindow } from "../types";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch();
});

afterAll(() => browser.close());

test("actions.click works on a link", async () => {
  await browser._browser!.url("http://localhost:5000");
  await browser.injectSdk();

  await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    qawolf.actions.click('//*[@id="content"]/ul/li[3]/a');
  });

  const url = await browser._browser!.getUrl();

  expect(url).toBe("http://localhost:5000/broken_images");
});

test("actions.setInputValue sets an input value", async () => {
  await browser._browser!.url("http://localhost:5000/login");
  await browser.injectSdk();

  await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    qawolf.actions.setInputValue('//*[@id="username"]', "spirit");
  });

  const inputs = await browser._browser!.$$("input");
  const username = await inputs[0].getValue();
  const password = await inputs[1].getValue();

  expect(username).toBe("spirit");
  expect(password).toBeFalsy();
});
