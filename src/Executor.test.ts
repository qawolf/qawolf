import Browser from "./Browser";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch("http://localhost:5000");
  await browser.injectSdk();
});

afterAll(() => browser.close());

test("Executor clicks on a link", async () => {
  await browser._browser!.execute(
    actions => {
      const { Executor } = (window as any).qawolf;
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
  await browser._browser!.execute(
    actions => {
      const { Executor } = (window as any).qawolf;
      const executor = new Executor(actions);
      executor.run();
    },
    [
      {
        sourceEventId: 11,
        target: {
          xpath: '//*[@id="content"]/ul/li[18]/a'
        },
        type: "click"
      },
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

  const input = await browser._browser!.$("input");
  const inputValue = input.getValue();

  expect(url).toBe("http://localhost:5000/login");
  expect(inputValue).toBe("spirit");
});
