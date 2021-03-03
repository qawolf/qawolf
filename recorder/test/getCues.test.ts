import { Browser, BrowserContext, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { Cue } from "../src/types";
import { launch } from "./utils";

let browser: Browser;
let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  context = await browser.newContext();
  page = await context.newPage();

  // workaround since we need to navigate for init script
  await page.goto("file://" + require.resolve("./ActionRecorderTestPage.html"));
});

afterAll(() => browser.close());

describe("getCues", () => {
  const getCues = async (selector: string): Promise<Cue[]> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLElement;
        return qawolf.getCues(target, 0);
      },
      { selector }
    );

  it("gets non-dynamic attributes", async () => {
    await page.setContent(`
  <html>
    <body>
      <div aria-label="aria label" contenteditable="true" href="http://example.org" id="id" name="name" role="button">Submit</div>
      <img alt="alt" src="wolf.png" title="title">
      <input placeholder="placeholder" type="number" value="42">
      <label for="id">Label</label>
    </body>
  </html>
  `);

    const divCues = await getCues("div");
    expect(divCues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 5,
          "type": "id",
          "value": "#id",
        },
        Object {
          "level": 0,
          "penalty": 8,
          "type": "attribute",
          "value": "[aria-label=\\"aria\\\\ label\\"]",
        },
        Object {
          "level": 0,
          "penalty": 10,
          "type": "attribute",
          "value": "[name=\\"name\\"]",
        },
        Object {
          "level": 0,
          "penalty": 15,
          "type": "attribute",
          "value": "[href=\\"http\\\\:\\\\/\\\\/example\\\\.org\\"]",
        },
        Object {
          "level": 0,
          "penalty": 20,
          "type": "attribute",
          "value": "[role=\\"button\\"]",
        },
        Object {
          "level": 0,
          "penalty": 30,
          "type": "attribute",
          "value": "[contenteditable=\\"true\\"]",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "div",
        },
      ]
    `);

    const imgCues = await getCues("img");
    expect(imgCues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 10,
          "type": "attribute",
          "value": "[title=\\"title\\"]",
        },
        Object {
          "level": 0,
          "penalty": 15,
          "type": "attribute",
          "value": "[src=\\"wolf\\\\.png\\"]",
        },
        Object {
          "level": 0,
          "penalty": 20,
          "type": "attribute",
          "value": "[alt=\\"alt\\"]",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "img",
        },
      ]
    `);

    const inputCues = await getCues("input");
    expect(inputCues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 10,
          "type": "attribute",
          "value": "[placeholder=\\"placeholder\\"]",
        },
        Object {
          "level": 0,
          "penalty": 10,
          "type": "attribute",
          "value": "[value=\\"\\\\34 2\\"]",
        },
        Object {
          "level": 0,
          "penalty": 20,
          "type": "attribute",
          "value": "[type=\\"number\\"]",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "input",
        },
      ]
    `);

    const labelCues = await getCues("label");
    expect(labelCues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 5,
          "type": "attribute",
          "value": "[for=\\"id\\"]",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "label",
        },
      ]
    `);
  });

  it("gets non-dynamic classes", async () => {
    await page.setContent(`
    <html>
      <body>
        <a class="s215asf hello">Submit</a>
      </body>
    </html>
    `);

    const cues = await getCues("a");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 12,
          "type": "class",
          "value": ".hello",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a",
        },
      ]
    `);
  });

  it("gets id", async () => {
    await page.setContent(`
  <html>
    <body>
      <a id="hello-world">Submit</a>
    </body>
  </html>
  `);

    const cues = await getCues("a");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 5,
          "type": "id",
          "value": "#hello-world",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a",
        },
      ]
    `);
  });

  it("gets tagname based on sibling order", async () => {
    await page.setContent(`
  <html>
    <body>
      <a>1</a>
      <a>2</a>
      <a>3</a>
    </body>
  </html>
  `);

    const cues1 = await getCues("a");
    expect(cues1).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a",
        },
      ]
    `);

    const cues2 = await getCues("a:nth-of-type(2)");
    expect(cues2).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a:nth-of-type(2)",
        },
      ]
    `);

    const cues3 = await getCues("a:nth-of-type(3)");
    expect(cues3).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a:nth-of-type(3)",
        },
      ]
    `);
  });

  it("gets test attributes", async () => {
    await page.setContent(`
<html>
  <body>
    <a data-cy="cypress" data-e2e="e2e" data-qa="qa"
    data-test="test" data-test-company="test-company" qa-company="qa-company">Submit</a>
  </body>
</html>
`);

    const cues = await getCues("a");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[data-cy=\\"cypress\\"]",
        },
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[data-e2e=\\"e2e\\"]",
        },
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[data-qa=\\"qa\\"]",
        },
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[data-test=\\"test\\"]",
        },
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[data-test-company=\\"test-company\\"]",
        },
        Object {
          "level": 0,
          "penalty": 0,
          "type": "attribute",
          "value": "[qa-company=\\"qa-company\\"]",
        },
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a",
        },
      ]
    `);
  });

  it("ignores dynamic attribute values", async () => {
    await page.setContent(`
  <html>
    <body>
      <a name="bu32879fDi">Submit</a>
    </body>
  </html>
  `);

    const cues = await getCues("a");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "a",
        },
      ]
    `);
  });

  it("ignores empty attr values", async () => {
    await page.setContent(`
  <html>
    <body>
      <input role>
    </body>
  </html>
  `);

    const cues = await getCues("input");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "penalty": 40,
          "type": "tag",
          "value": "input",
        },
      ]
    `);
  });
});

describe("getTagValue", () => {
  const getTagValue = async (selector: string): Promise<string> =>
    page.evaluate((selector) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(selector) as HTMLElement;
      return qawolf.getTagValue(element);
    }, selector);

  beforeAll(() =>
    page.setContent(`
    <html>
      <body>
        <div id="one-child">
          <a>no siblings</a>
        </div>
        <div id="many-children">
          <a>first child</a>
          <a>second child</a>
          <a>third child</a>
        </div>
      </body>
    </html>
    `)
  );

  it("returns tag name if no parent element", async () => {
    const value = await getTagValue("html");
    expect(value).toBe("html");
  });

  it("returns tag name if element has no siblings", async () => {
    const value = await getTagValue("#one-child a");
    expect(value).toBe("a");
  });

  it("returns tag name if element is first child", async () => {
    const value = await getTagValue("#many-children a");
    expect(value).toBe("a");
  });

  it("returns nth-of-type tag if element is a lower sibling", async () => {
    const value = await getTagValue("#many-children a:nth-of-type(2)");
    expect(value).toBe("a:nth-of-type(2)");
  });
});
