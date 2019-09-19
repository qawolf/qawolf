import Browser from "./Browser";
import { QAWolfWindow } from "./types";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
});

afterAll(() => browser.close());

test("Executor clicks on a link", async () => {
  await browser.launch("http://localhost:5000");
  await browser.injectSdk();

  await browser._browser!.execute(
    actions => {
      const { Executor } = (window as QAWolfWindow).qawolf;
      const executor = new Executor(actions);
      executor.run();
    },
    [
      {
        sourceEventId: 11,
        target: {
          xpath: '//*[@id="content"]/ul/li[3]/a'
        },
        type: "click"
      }
    ]
  );

  const url = await browser._browser!.getUrl();

  expect(url).toBe("http://localhost:5000/broken_images");
});

test("Executor types into an input", async () => {
  await browser.launch("http://localhost:5000/login");
  await browser.injectSdk();

  await browser._browser!.execute(
    actions => {
      const { Executor } = (window as any).qawolf;
      const executor = new Executor(actions);
      executor.run();
    },
    [
      {
        sourceEventId: 12,
        target: {
          xpath: '//*[@id="username"]'
        },
        type: "type",
        value: "spirit"
      }
    ]
  );

  const url = await browser._browser!.getUrl();

  const inputs = await browser._browser!.$$("input");
  const username = await inputs[0].getValue();
  const password = await inputs[1].getValue();

  expect(url).toBe("http://localhost:5000/login");
  expect(username).toBe("spirit");
  expect(password).toBeFalsy();
});
