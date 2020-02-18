import { BrowserContext, launch, Page } from "@qawolf/browser";
import { QAWolfWeb } from "@qawolf/web";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch();
});

afterAll(() => context.close());

describe("buildCssSelector", () => {
  describe("click", () => {
    beforeAll(async () => {
      await context.goto(`http://localhost:3000/buttons`);
      page = await context.page();
    });

    it("returns undefined if no attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.getElementById("#html-button")!;

        return qawolf.buildCssSelector({
          element,
          attribute: "data-qa",
          action: "click"
        });
      });

      expect(selector).toBeUndefined();
    });

    it("returns selector if attribute present", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(
          "[data-qa='html-button']"
        ) as HTMLElement;

        return qawolf.buildCssSelector({
          element,
          attribute: "data-qa",
          action: "click"
        });
      });

      expect(selector).toBe("[data-qa='html-button']");
    });

    it("returns selector if attribute present on ancestor", async () => {
      const selector = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.getElementById("html-button-child")!;

        return qawolf.buildCssSelector({
          element,
          attribute: "data-qa",
          action: "click"
        });
      });

      expect(selector).toBe("[data-qa='html-button-with-children']");

      // document.getElementsByClassName("MuiButton-label")[0]

      const selector2 = await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.getElementsByClassName(
          "MuiButton-label"
        )[0] as HTMLElement;

        return qawolf.buildCssSelector({
          element,
          attribute: "data-qa",
          action: "click"
        });
      });

      expect(selector2).toBe("[data-qa='material-button']");
    });

    it("returns correct selector for radio buttons", () => {});

    it("returns correct selector for checkboxes", () => {});

    it("returns correct selector for toggles", () => {});

    it("returns correct selector for range inputs", () => {});
  });

  describe("scroll", () => {
    it("returns undefined if no attribute present", () => {});

    it("returns selector if attribute present", () => {});

    it("returns selector if attribute present on ancestor", () => {});
  });

  describe("type", () => {
    it("returns undefined if no attribute present", () => {});

    it("returns selector if attribute present", () => {});

    it("returns selector and target if attribute present on ancestor", () => {});

    it("return selector and target attribute for content editable", () => {});
  });

  describe("select", () => {
    it("returns undefined if no attribute present", () => {});

    it("returns selector if attribute present", () => {});

    it("returns selector and target if attribute present on ancestor", () => {});
  });
});

// describe("getAttributeValue", () => {
//   it("returns null if data attribute not specified", async () => {
//     const attribute = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       const username = document.getElementById("username")!;
//       const result = qawolf.element.getAttributeValue(username, "");
//       return result;
//     });

//     expect(attribute).toBeNull();
//   });

//   it("returns null if element does not have specified data attribute", async () => {
//     const attribute = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       const username = document.getElementById("username")!;
//       username.setAttribute("data-other", "user");

//       const result = qawolf.element.getAttributeValue(username, "data-qa");
//       username.removeAttribute("data-other");

//       return result;
//     });

//     expect(attribute).toBeNull();
//   });

//   it("gets attribute when there are multiple specified", async () => {
//     const attribute = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       const username = document.getElementById("username")!;
//       username.setAttribute("data-qa", "user");

//       const result = qawolf.element.getAttributeValue(
//         username,
//         "data-id , data-qa "
//       );
//       username.removeAttribute("data-qa");

//       return result;
//     });

//     expect(attribute).toEqual({ attribute: "data-qa", value: "user" });
//   });

//   it("gets attribute when there is one specified", async () => {
//     const attribute = await page.evaluate(() => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       const username = document.getElementById("username")!;
//       const result = qawolf.element.getAttributeValue(username, "id");
//       return result;
//     });

//     expect(attribute).toEqual({ attribute: "id", value: "username" });
//   });
// });
