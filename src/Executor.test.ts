import Browser from "./Browser";
// execute a click on the internet & check the url is correct
// execute a type on the internet & check the text is correct

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  await browser.launch("http://localhost:5000");
  await browser.injectSdk();
});

// afterAll(() => browser.close());

test("Executor clicks on a link", async () => {
  await browser._browser!.execute(actions => {
    const { Executor } = (window as any).qawolf;
    const executor = new Executor(actions);
    executor.run();
  }, []);
  // expect(isLoaded).toEqual(true);
});

// test("Executor types into an input", async () => {});
