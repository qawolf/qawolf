import { BrowserContext, launch, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch();
});

afterAll(() => context.close());

describe("buildCssSelector", () => {
  describe("click: button", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}buttons`);
      page = await context.page();
    });

    it("returns undefined if no attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("#html-button")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBeUndefined();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='html-button']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-button']");
    });

    it("returns selector if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("html-button-child")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-button-with-children']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementsByClassName(
          "MuiButton-label"
        )[0] as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector2).toBe("[data-qa='material-button']");
    });
  });

  describe("click: radio", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}radio-inputs`);
      page = await context.page();
    });

    it("returns undefined if no attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("another")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBeUndefined();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("single")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-radio']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementsByClassName(
          "MuiFormControlLabel-label"
        )[0] as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector2).toBe("[data-qa='material-radio']");
    });

    it("returns selector if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("dog")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-radio-group'] [value='dog']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("blue")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector2).toBe("[data-qa='material-radio-group'] [value='blue']");
    });
  });

  describe("click: checkbox", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}checkbox-inputs`);
      page = await context.page();
    });

    it("returns undefined if no attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("another")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBeUndefined();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("single")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-checkbox']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementsByClassName(
          "MuiFormControlLabel-label"
        )[0] as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector2).toBe("[data-qa='material-checkbox']");
    });

    it("returns selector if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("dog")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector).toBe("[data-qa='html-checkbox-group'] [value='dog']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.getElementById("blue")!;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa",
          isClick: true
        });
      });

      expect(selector2).toBe(
        "[data-qa='material-checkbox-group'] [value='blue']"
      );
    });
  });

  describe("type: input", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}text-inputs`);
      page = await context.page();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          '[type="password"]'
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector).toBe("[data-qa='html-password-input']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector("textarea") as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector2).toBe("[data-qa='html-textarea']");
    });

    it("returns selector and target if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          '[data-qa="material-text-input"] input'
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector).toBe("[data-qa='material-text-input'] input");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='material-textarea'] textarea"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector2).toBe("[data-qa='material-textarea'] textarea");
    });
  });

  describe("type: content editable", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}content-editables`);
      page = await context.page();
    });

    it("return selector and target attribute", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='content-editable']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector).toBe("[data-qa='content-editable']");

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='draftjs'] [contenteditable='true']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector2).toBe("[data-qa='draftjs'] [contenteditable='true']");

      const selector3 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='quill'] [contenteditable='true']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector3).toBe("[data-qa='quill'] [contenteditable='true']");
    });
  });

  describe("select", () => {
    beforeAll(async () => {
      await context.goto(`${CONFIG.sandboxUrl}selects`);
      page = await context.page();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='html-select']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector).toBe("[data-qa='html-select']");
    });

    it("returns selector and target if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(
          "[data-qa='material-select-native'] select"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          target,
          attribute: "data-qa"
        });
      });

      expect(selector).toBe("[data-qa='material-select-native'] select");
    });
  });
});

describe("getAttributeValue", () => {
  beforeAll(async () => {
    await context.goto(`${CONFIG.sandboxUrl}buttons`);
    page = await context.page();
  });

  it("returns null if attribute not specified", async () => {
    const attribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementById("html-button")!;
      return qawolf.getAttributeValue(button, "");
    });

    expect(attribute).toBeNull();
  });

  it("eturns null if element does not have specified attribute", async () => {
    const attribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementById("html-button")!;
      return qawolf.getAttributeValue(button, "data-qa");
    });

    expect(attribute).toBeNull();
  });

  it("gets attribute when there is one specified", async () => {
    const attribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.querySelector(
        "[data-qa='html-button']"
      ) as HTMLElement;
      return qawolf.getAttributeValue(button, "data-qa");
    });

    expect(attribute).toEqual({ attribute: "data-qa", value: "html-button" });
  });

  it("gets attribute when there are multiple specified", async () => {
    const attribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.querySelector(
        "[data-qa='html-button']"
      ) as HTMLElement;
      return qawolf.getAttributeValue(button, "data-qa,data-test");
    });

    expect(attribute).toEqual({ attribute: "data-qa", value: "html-button" });
  });

  it("ignores whitespace in the attribute", async () => {
    const attribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementById("html-button")!;
      return qawolf.getAttributeValue(button, " id ");
    });

    expect(attribute).toEqual({ attribute: "id", value: "html-button" });

    const attribute2 = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementById("html-button")!;
      return qawolf.getAttributeValue(button, "data-qa, id ");
    });

    expect(attribute2).toEqual({ attribute: "id", value: "html-button" });
  });
});
