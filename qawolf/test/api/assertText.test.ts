import { Page } from "playwright";
import { LaunchResult, assertText, launch } from "../../src";

describe("assertText", () => {
  let launched: LaunchResult;
  let page: Page;

  beforeAll(async () => {
    launched = await launch();

    page = await launched.context.newPage();
    await page.setContent(`
      <html>
        <body>
          <p>Hello World</p>
          <input type="text" value="my input text">
          <button>Submit</button>
        </body>
      </html>
    `);
  });

  afterAll(() => launched.browser.close());

  it("does not throw an error if body contains text", async () => {
    const testFn = async (): Promise<void> => {
      return assertText(page, "Hello World");
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it("does not throw an error if element contains text", async () => {
    const testFn = async (): Promise<void> => {
      return assertText(page, "Hello World", { selector: "p" });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it("does not throw an error if input value contains text", async () => {
    const testFn = async (): Promise<void> => {
      return assertText(page, "my input text", { selector: "input" });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it("throws an error if element never appears", async () => {
    const testFn = async (): Promise<void> => {
      return assertText(page, "text", { selector: "#invalid", timeout: 500 });
    };

    await expect(testFn()).rejects.toThrowError(
      'assertText: "text" not found in "#invalid"'
    );
  });

  it("throws an error if element does not contain text", async () => {
    const testFn = async (): Promise<void> => {
      return assertText(page, "other text", {
        selector: "button",
        timeout: 500,
      });
    };

    await expect(testFn()).rejects.toThrowError(
      'assertText: "other text" not found in "button"'
    );
  });
});
