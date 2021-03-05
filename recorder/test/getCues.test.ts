import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { Cue } from "../src/types";
import { launch, LaunchResult } from "./utils";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

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

  it("allows specific dynamic attributes", async () => {
    await page.setContent(`
    <html>
      <body>
        <input href="bu32879fDi" placeholder="bu32879fDi" src="bu32879fDi" type="button" value="bu32879fDi">
      </body>
    </html>
    `);

    const cues = await getCues("input");
    expect(
      cues.filter((c) => c.type === "attribute").map((c) => c.value)
    ).toEqual([
      '[href="bu32879fDi"]',
      '[placeholder="bu32879fDi"]',
      '[src="bu32879fDi"]',
      '[type="button"]',
      '[value="bu32879fDi"]',
    ]);
  });

  it("allows specific value attributes", async () => {
    await page.setContent(`
    <html>
      <body>
        <a value="deny">a</a>
        <button value="button">button</button> 
        <option value="option"></option> 
        <input type="button" value="input-button">
        <input type="checkbox" value="input-checkbox">
        <input type="radio" value="input-radio">
        <input type="submit" value="input-submit">
      </body>
    </html>
    `);

    const cueSets = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7].map(async (i) => {
        const cues = await getCues(`body :nth-child(${i})`);
        return cues.filter((c) => c.type === "attribute").map((c) => c.value);
      })
    );

    expect(cueSets).toEqual([
      [], // a should not have a value cue
      ['[value="button"]'],
      ['[value="option"]'],
      ['[type="button"]', '[value="input-button"]'],
      ['[type="checkbox"]', '[value="input-checkbox"]'],
      ['[type="radio"]', '[value="input-radio"]'],
      ['[type="submit"]', '[value="input-submit"]'],
    ]);
  });

  it("has 1 cue for html and body", async () => {
    await page.setContent(`<html><body></body></html>`);

    expect(await getCues("html")).toEqual([
      {
        level: 0,
        penalty: 0,
        type: "tag",
        value: "html",
      },
    ]);

    expect(await getCues("body")).toEqual([
      {
        level: 0,
        penalty: 0,
        type: "tag",
        value: "body",
      },
    ]);
  });

  it("has non-dynamic attributes", async () => {
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
    expect(divCues.map((cues) => cues.value)).toEqual([
      "div",
      "Submit",
      '[aria-label="aria label"]',
      '[contenteditable="true"]',
      '[href="http://example.org"]',
      "#id",
      '[name="name"]',
      '[role="button"]',
    ]);

    const imgCues = await getCues("img");
    expect(imgCues.map((cues) => cues.value)).toEqual([
      "img",
      '[alt="alt"]',
      '[src="wolf.png"]',
      '[title="title"]',
    ]);

    const inputCues = await getCues("input");
    expect(inputCues.map((cues) => cues.value)).toEqual([
      "input",
      '[placeholder="placeholder"]',
      '[type="number"]',
    ]);

    const labelCues = await getCues("label");
    expect(labelCues.map((cues) => cues.value)).toEqual([
      "label",
      "Label",
      '[for="id"]',
    ]);
  });

  it("has non-dynamic classes", async () => {
    await page.setContent(`
    <html>
      <body>
        <a class="s215asf hello">Submit</a>
      </body>
    </html>
    `);

    const cues = await getCues("a");
    expect(cues.filter((c) => c.type === "class").map((c) => c.value)).toEqual([
      ".hello",
    ]);
  });

  it("has id", async () => {
    await page.setContent(`
  <html>
    <body>
      <a id="hello-world">Submit</a>
    </body>
  </html>
  `);

    const cues = await getCues("a");
    expect(cues.filter((c) => c.type === "id").map((c) => c.value)).toEqual([
      "#hello-world",
    ]);
  });

  it("has tag cue", async () => {
    await page.setContent(`
  <html>
    <body>
      <a>1</a>
      <a>2</a>
    </body>
  </html>
  `);

    const cues = await getCues("a:nth-of-type(2)");
    expect(cues.map((c) => c.value)).toEqual(["a:nth-of-type(2)", "2"]);
  });

  it("has test attributes", async () => {
    await page.setContent(`
<html>
  <body>
    <a data-cy="cypress" data-e2e="e2e" data-qa="qa"
    data-test="test" data-test-company="test-company" qa-company="qa-company">Submit</a>
  </body>
</html>
`);

    const cues = await getCues("a");
    expect(
      cues.filter((c) => c.type === "attribute").map((c) => c.value)
    ).toEqual([
      '[data-cy="cypress"]',
      '[data-test="test"]',
      '[data-test-company="test-company"]',
      '[qa-company="qa-company"]',
    ]);
  });

  it("has unspecified attributes", async () => {
    await page.setContent(`
  <html>
    <body>
      <a data-cta="sign up">Sign Up</a>
    </body>
  </html>
  `);

    const cues = await getCues("a");
    expect(
      cues.filter((c) => c.type === "attribute").map((c) => c.value)
    ).toEqual(['[data-cta="sign up"]']);
  });

  it("skips dynamic attribute values", async () => {
    await page.setContent(`
    <html>
      <body>
        <a name="bu32879fDi">Submit</a>
      </body>
    </html>
    `);

    const cues = await getCues("a");
    expect(cues.map((c) => c.value)).toEqual(["a", "Submit"]);
  });

  it("skips empty attr values", async () => {
    await page.setContent(`
    <html>
      <body>
        <input role>
      </body>
    </html>
    `);

    const cues = await getCues("input");
    expect(cues.map((c) => c.value)).toEqual(["input"]);
  });

  it("skips specific attributes", async () => {
    await page.setContent(`
    <html>
      <body>
        <input data-reactid="1">
      </body>
    </html>
    `);

    const cues = await getCues("input");
    expect(cues.map((c) => c.value)).toEqual(["input"]);
  });
});

describe("getTagCue", () => {
  const getTagCue = async (selector: string): Promise<Cue> =>
    page.evaluate((selector) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(selector) as HTMLElement;
      return qawolf.getTagCue(element, 0);
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
    const cue = await getTagCue("html");
    expect(cue.value).toBe("html");
  });

  it("returns tag name if element has no siblings", async () => {
    const cue = await getTagCue("#one-child a");
    expect(cue.value).toBe("a");
  });

  it("returns tag name if element is first child", async () => {
    const cue = await getTagCue("#many-children a");
    expect(cue.value).toBe("a");
  });

  it("returns nth-of-type tag if element is a lower sibling", async () => {
    const cue = await getTagCue("#many-children a:nth-of-type(2)");
    expect(cue.value).toBe("a:nth-of-type(2)");
  });
});
