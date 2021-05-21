import { Page } from "playwright";
import { LaunchResult, getValue, launch } from "../../src";

describe("getValue", () => {
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
            <input id="text-input" type="text" value="text input value" />
            <input id="radio-input" type="radio" value="radio input value" />
            <input id="checkbox-input" type="checkbox" checked />
            <input id="checkbox-input-unchecked" type="checkbox" />
            <input id="number-input" type="number" value="42" />
            <select id="select">
              <option value="selected" selected>Choose me</option>
              <option value="no-selected">Not me</option>
            </select>
            <select id="select-empty">
              <option value="">Choose an option</option>
              <option value="selected">Choose me</option>
            </select>
            <select id="select-no-options"></select>
            <svg viewBox="0 0 10 10" x="200" width="100">
              <circle cx="5" cy="5" r="4" />
            </svg>
          </body>
        </html>
      `);
  });

  afterAll(() => launched.browser.close());

  it("gets value of paragraph", async () => {
    const value = await getValue(page, "p");
    expect(value).toBe("Hello World");
  });

  it("gets value of button", async () => {
    const value = await getValue(page, "button");
    expect(value).toBe("Click me");
  });

  it("gets value of text input", async () => {
    const value = await getValue(page, "#text-input");
    expect(value).toBe("text input value");
  });

  it("gets value of radio input", async () => {
    const value = await getValue(page, "#radio-input");
    expect(value).toBe("radio input value");
  });

  it("gets value of checkbox input", async () => {
    const value = await getValue(page, "#checkbox-input");
    expect(value).toBe(true);

    const value2 = await getValue(page, "#checkbox-input-unchecked");
    expect(value2).toBe(false);
  });

  it("gets value of number input", async () => {
    const value = await getValue(page, "#number-input");
    expect(value).toBe("42");
  });

  it("gets value of select", async () => {
    const value = await getValue(page, "#select");
    expect(value).toBe("selected");

    const value2 = await getValue(page, "#select-empty");
    expect(value2).toBe("");

    const value3 = await getValue(page, "#select-no-options");
    expect(value3).toBe("");
  });

  it("returns empty string for svg", async () => {
    const value = await getValue(page, "svg");
    expect(value).toBe("");
  });
});
