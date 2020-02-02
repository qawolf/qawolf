import { BrowserContext, launch, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.testUrl}login` });
  page = await context.page();
});

afterAll(() => context.close());

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
    await context.goto(`${CONFIG.testUrl}login`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.serialize.nodeToHtml(document.querySelector("button")!, {
        innerText: true
      });
    });

    expect(html).toEqual(
      '<button class="radius" type="submit" innertext="Login"><i class="fa fa-2x fa-sign-in"> Login</i></button>'
    );
  });

  it("serializes image alt and src", async () => {
    await context.goto(`${CONFIG.testUrl}broken_images`);

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

  it("serializes labels", async () => {
    await context.goto(`${CONFIG.testUrl}login`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const input = document.querySelector("input")!;
      return qawolf.serialize.nodeToHtml(input, {
        labels: true
      });
    });

    expect(html).toEqual(
      '<input type="text" name="username" id="username" labels="Username" />'
    );
  });
});
