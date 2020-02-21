import { BrowserContext, launch, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.sandboxUrl}login` });
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
    await context.goto(`${CONFIG.sandboxUrl}login`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.serialize.nodeToHtml(document.querySelector("button")!, {
        innerText: true
      });
    });

    expect(html).toEqual(
      '<button type="submit" innertext="Log in" style="cursor: pointer;"><p>Log in</p></button>'
    );
  });

  it("serializes image alt and src", async () => {
    await context.goto(`${CONFIG.sandboxUrl}images`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const image = document.querySelector("img")!;

      return qawolf.serialize.nodeToHtml(image);
    });

    expect(html).toEqual('<img alt="spirit" src="logo192.png" />');
  });

  it("serializes labels", async () => {
    await context.goto(`${CONFIG.sandboxUrl}login`);

    const html = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const input = document.querySelector("input")!;
      return qawolf.serialize.nodeToHtml(input, {
        labels: true
      });
    });

    expect(html).toEqual(
      '<input autocomplete="off" id="username" type="text" value="" labels="Username" />'
    );
  });
});
