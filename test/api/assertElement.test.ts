import { Page } from "playwright";
import { LaunchResult, assertElement, launch } from "../../src";

describe("assertElement", () => {
  let launched: LaunchResult;
  let page: Page;

  beforeAll(async () => {
    launched = await launch();

    page = await launched.context.newPage();
    await page.setContent(`
      <html>
        <body>
          <p>Hello World</p>
          <button id="button">Click me</button>
        </body>
      </html>
    `);
  });

  afterAll(() => launched.browser.close());

  it("does not throw an error if page contains element", async () => {
    const testFn = async (): Promise<void> => {
      return assertElement(page, "text='Hello World'");
    };

    await expect(testFn()).resolves.not.toThrowError();

    const testFn2 = async (): Promise<void> => {
      return assertElement(page, "#button");
    };

    await expect(testFn2()).resolves.not.toThrowError();
  });

  it("throws an error if element never appears", async () => {
    const testFn = async (): Promise<void> => {
      return assertElement(page, "#fakeId", { timeout: 500 });
    };

    await expect(testFn()).rejects.toThrowError(
      'assertElement: "#fakeId" not found'
    );
  });
});
