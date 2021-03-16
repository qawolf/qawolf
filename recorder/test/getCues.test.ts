import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { Cue } from "../src/types";
import { launch, LaunchResult, setBody } from "./utils";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

describe("getCues", () => {
  const getCues = async (
    selector: string,
    maxClasses?: number
  ): Promise<Cue[]> =>
    page.evaluate(
      ({ maxClasses, selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLElement;
        return qawolf.getCues(target, 0, maxClasses);
      },
      { maxClasses, selector }
    );

  it("allows specific dynamic attributes", async () => {
    await setBody(
      page,
      `<input href="bu32879fDi" placeholder="bu32879fDi" src="bu32879fDi" type="button" value="bu32879fDi">`
    );

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
    await setBody(
      page,
      `
<a value="deny">a</a>
<button value="button">button</button> 
<option value="option"></option> 
<input type="button" value="input-button">
<input type="checkbox" value="input-checkbox">
<input type="radio" value="input-radio">
<input type="submit" value="input-submit">
`
    );

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
    await setBody(page, "");

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
    await setBody(
      page,
      `
<div aria-label="aria label" contenteditable="true" href="http://example.org" id="id" name="name" role="button">Submit</div>
<img alt="alt" src="wolf.png" title="title">
<input placeholder="placeholder" type="number" value="42">
<label for="id">Label</label>`
    );

    const divCues = await getCues("div");
    expect(
      divCues.map((cues) => cues.value).sort((a, b) => a.length - b.length)
    ).toEqual([
      "div",
      "#id",
      "Submit",
      ":visible",
      '[name="name"]',
      '[role="button"]',
      '[contenteditable="true"]',
      '[aria-label="aria label"]',
      '[href="http://example.org"]',
    ]);

    const imgCues = await getCues("img");
    expect(imgCues.map((cues) => cues.value)).toEqual([
      "img",
      ":visible",
      '[alt="alt"]',
      '[src="wolf.png"]',
      '[title="title"]',
    ]);

    const inputCues = await getCues("input");
    expect(inputCues.map((cues) => cues.value)).toEqual([
      "input",
      ":visible",
      '[placeholder="placeholder"]',
      '[type="number"]',
    ]);

    const labelCues = await getCues("label");
    expect(labelCues.map((cues) => cues.value)).toEqual([
      "label",
      "Label",
      ":visible",
      '[for="id"]',
    ]);
  });

  it("has non-dynamic classes", async () => {
    await setBody(page, `<a class="s215asf hello">Submit</a>`);

    const result = await getCues("a");
    expect(
      result.filter((c) => c.type === "class").map((c) => c.value)
    ).toEqual([".hello"]);

    await setBody(
      page,
      `<a class="hello world grid flex small large button">Submit</a>`
    );

    // limits # of classes
    const result2 = await getCues("a", 5);
    expect(
      result2.filter((c) => c.type === "class").map((c) => c.value)
    ).toEqual([".hello", ".world", ".grid", ".flex", ".small"]);
  });

  it("has id", async () => {
    await setBody(page, `<a id="hello-world">Submit</a>`);

    const cues = await getCues("a");
    expect(cues.filter((c) => c.type === "id").map((c) => c.value)).toEqual([
      "#hello-world",
    ]);
  });

  it("has tag cue", async () => {
    await setBody(page, `<a>1</a><a>2</a>`);
    const cues = await getCues("a:nth-of-type(2)");
    expect(cues.map((c) => c.value)).toEqual([
      "a:nth-of-type(2)",
      "2",
      ":visible",
    ]);
  });

  it("has test attributes", async () => {
    await setBody(
      page,
      `<a data-cy="cypress" data-e2e="e2e" data-qa="qa" data-test="test" data-test-company="test-company" qa-company="qa-company">Submit</a>`
    );

    const cues = await getCues("a");
    expect(
      cues
        .filter((c) => c.type === "attribute")
        .map((c) => `${c.penalty}${c.value}`)
    ).toEqual([
      '0[data-cy="cypress"]',
      '0[data-e2e="e2e"]',
      '0[data-qa="qa"]',
      '0[data-test="test"]',
      '0[data-test-company="test-company"]',
      '0[qa-company="qa-company"]',
    ]);
  });

  it("has text for level 0", async () => {
    await setBody(
      page,
      `<a>short text</a><a>long text will be penalized more</a>`
    );

    const result = await getCues("a");
    expect(
      result
        .filter((c) => c.type === "text")
        .map((c) => `${c.penalty}${c.value}`)
    ).toEqual(["10short text"]);

    const result2 = await getCues("a:nth-of-type(2)");
    expect(
      result2
        .filter((c) => c.type === "text")
        .map((c) => `${c.penalty}${c.value}`)
    ).toEqual(["16long text will be penalized more"]);
  });

  it("has unspecified attributes", async () => {
    await setBody(page, `<a data-cta="sign up">Sign Up</a>`);

    const cues = await getCues("a");
    expect(
      cues.filter((c) => c.type === "attribute").map((c) => c.value)
    ).toEqual(['[data-cta="sign up"]']);
  });

  it("skips dynamic attribute values", async () => {
    await setBody(page, `<a name="bu32879fDi">Submit</a>`);

    const cues = await getCues("a");
    expect(cues.map((c) => c.value)).toEqual(["a", "Submit", ":visible"]);
  });

  it("skips empty attr values", async () => {
    await setBody(page, `<input role>`);

    const cues = await getCues("input");
    expect(cues.map((c) => c.value)).toEqual(["input", ":visible"]);
  });

  it("skips specific attributes", async () => {
    await setBody(page, `<input data-reactid="1">`);

    const cues = await getCues("input");
    expect(cues.map((c) => c.value)).toEqual(["input", ":visible"]);
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
    setBody(
      page,
      `
<div id="one-child">
  <a>no siblings</a>
</div>
<div id="many-children">
  <a>first child</a>
  <a>second child</a>
  <a>third child</a>
</div>`
    )
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
