import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("nodeToDocSelector", () => {
  it("serializes html and body elements by their tag only", async () => {
    let doc = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.serialize.nodeToDocSelector(
        document.querySelector("html")!
      );
    });

    expect(doc).toEqual({
      ancestors: [],
      node: {
        attrs: {},
        children: [],
        name: "html",
        type: "tag",
        voidElement: true
      }
    });

    doc = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.serialize.nodeToDocSelector(
        document.querySelector("body")!
      );
    });

    expect(doc).toEqual({
      ancestors: [],
      node: {
        attrs: {},
        children: [],
        name: "body",
        type: "tag",
        voidElement: true
      }
    });
  });
});

describe("nodeToHtml", () => {
  it("serializes innerText as an attribute", async () => {
    await browser.goto(`${CONFIG.testUrl}login`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.serialize.nodeToHtml(
        document.querySelector("button")!,
        true
      );
    });

    expect(html).toEqual(
      '<button class="radius" type="submit" innertext=" Login"><i class="fa fa-2x fa-sign-in"> Login</i></button>'
    );
  });

  it("serializes image alt and src", async () => {
    await browser.goto(`${CONFIG.testUrl}broken_images`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const image = document.querySelector("img")!;
      image.alt = "Alt text";
      image.src = "/myurl";

      return qawolf.serialize.nodeToHtml(image);
    });

    expect(html).toEqual(
      '<img style="position: absolute; top: 0; right: 0; border: 0;" src="/myurl" alt="Alt text" />'
    );
  });
});

// describe("getLabels", () => {
// it("correctly returns labels", async () => {
//   const nullLabels = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getLabels(document.getElementsByTagName("h2")[0]);
//   });

//   expect(nullLabels).toBeNull();

//   const usernameLabels = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getLabels(
//       document.getElementsByTagName("input")[0]
//     );
//   });

//   expect(usernameLabels).toEqual(["username"]);
// });
// });

// it("returns disabled option text for select", async () => {
//   await page.goto(`${CONFIG.testUrl}dropdown`);

//   const placeholder = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getPlaceholder(
//       document.getElementsByTagName("select")[0]
//     );
//   });

//   expect(placeholder).toBe("please select an option");
//   await page.goto(`${CONFIG.testUrl}login`);
// });
