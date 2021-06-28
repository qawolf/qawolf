import waitUntil from "async-wait-until";
import { Frame, Page } from "playwright";

import { CodeModel } from "../../src/code/CodeModel";
import { PATCH_HANDLE } from "../../src/code/patchUtils";
import { ElementChooser } from "../../src/environment/ElementChooser";
import { ElementChooserValue } from "../../src/types";
import {
  FixturesServer,
  launch,
  LaunchResult,
  serveFixtures,
  setBody,
} from "../utils";

let launched: LaunchResult;
let page: Page;
let server: FixturesServer;
const variables: Record<string, Page | Frame> = {}

const chooser = new ElementChooser({ codeModel: new CodeModel(), variables });
let events: ElementChooserValue[] = [];

chooser.on("elementchooser", (e) => events.push(e));

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
  variables.page = page;
  await chooser.setContext(launched.context);

  // iFrames won't load from file:// URL
  server = await serveFixtures();
});

afterAll(async () => {
  server.close();
  await launched.browser.close()
});

function isActionRecorderStarted(): Promise<boolean> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qawolf: any = (window as any).qawolf;
    return qawolf.actionRecorder._isStarted;
  });
}

function isElementChooserStarted(): Promise<boolean> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qawolf: any = (window as any).qawolf;
    return qawolf.elementChooser._view._isStarted;
  });
}

describe("start", () => {
  beforeEach(async () => {
    await setBody(page, "<button>hello</button>");
    
    chooser._reset();
    events = [];
    await chooser.start();
  });

  it("stops the action recorder", async () => {
    expect(await isActionRecorderStarted()).toBe(false);
  });

  it("starts the element chooser", async () => {
    expect(await isElementChooserStarted()).toBe(true);
  });

  it("emits isActive true", () => {
    expect(events[0]).toEqual(expect.objectContaining({ isActive: true }));
  });
});

describe("stop", () => {
  beforeEach(async () => {
    await setBody(page, "<button>hello</button>");
    chooser._reset();
    events = [];
    await chooser.start();
    await chooser.stop();
  });

  it("starts the action recorder", async () => {
    expect(await isActionRecorderStarted()).toBe(true);
  });

  it("stops the element chooser", async () => {
    expect(await isElementChooserStarted()).toBe(false);
  });

  it("emits isActive false", () => {
    expect(events[1]).toEqual(expect.objectContaining({ isActive: false }));
  });
});

describe("variables and init code", () => {
  it("brings page to front if necessary", async () => {
    chooser._reset();
    events = [];
    await setBody(page, "<button>hello</button>");
    await chooser.start();

    const page2 = await launched.context.newPage();
    variables.page2 = page2;
    // workaround since we need to navigate for init script
    await page2.goto("file://" + require.resolve("../fixtures/empty.html"));
    await setBody(page2, "<a>page2</a>");
  
    chooser._codeModel.setValue(`
  const page = await context.newPage();
  await page.goto("https://abc.com");
  const page2 = await context.newPage();
  await page2.goto("https://123.com");${PATCH_HANDLE}`)
  
    await page.click("button");
  
    await waitUntil(() => events.length > 1);
  
    expect(events[1]).toEqual({
      initializeCode: "await page.bringToFront();\n",
      isActive: true,
      isFillable: false,
      page,
      selectors: [],
      text: "hello",
      variable: "page"
    });
  });
  
  it("can choose in an iframe already in the code", async () => {
    await page.goto(`${server.url}/ContextEventCollector`);
    chooser._reset();
    events = [];

    chooser._codeModel.setValue(`
  const page = await context.newPage();
  await page.goto("https://abc.com");
  const frame = await (await page.waitForSelector('[data-qa="frame"]')).contentFrame();
  await frame.fill('[type="text"]', "");${PATCH_HANDLE}`)

    await chooser.start();

    const iframe = page.frames().find((frame) => frame.parentFrame() !== null)
    if (!iframe) throw new Error('Could not find iframe');
    variables.frame = iframe;
    await iframe.click("a");
  
    await waitUntil(() => events.length > 1);
  
    expect(events[1]).toEqual({
      frame: iframe,
      frameSelector: "[data-qa=\"frame\"]",
      initializeCode: "",
      isActive: true,
      isFillable: false,
      page,
      selectors: [],
      text: "Do Nothing",
      variable: "frame"
    });

    // cleanup
    delete variables.frame;
  });
  
  it("can choose in an iframe not yet in the code", async () => {
    await page.goto(`${server.url}/ContextEventCollector`);

    chooser._reset();
    events = [];

    chooser._codeModel.setValue(`
  const page = await context.newPage();
  await page.goto("https://abc.com");${PATCH_HANDLE}`)

    await chooser.start();

    const iframe = page.frames().find((frame) => frame.parentFrame() !== null)
    if (!iframe) throw new Error('Could not find iframe');
    await iframe.click("a");
  
    await waitUntil(() => events.length > 1);
  
    expect(events[1]).toEqual({
      frame: iframe,
      frameSelector: "[data-qa=\"frame\"]",
      initializeCode: "const frame = await (await page.waitForSelector('[data-qa=\"frame\"]')).contentFrame();\n",
      isActive: true,
      isFillable: false,
      page,
      selectors: [],
      text: "Do Nothing",
      variable: "frame"
    });
  });
});

// Keep this one last because it's impossible to reset to the 
// original context right now
it("emits elements for the current context", async () => {
  await page.goto("file://" + require.resolve("../fixtures/empty.html"));
  await setBody(page, "<button>hello</button>");
  chooser._reset();
  events = [];
  await chooser.start();
  
  await page.click("button");

  await waitUntil(() => events.length > 1);

  expect(events[1]).toEqual({
    initializeCode: "",
    isActive: true,
    isFillable: false,
    page,
    selectors: [],
    text: "hello",
    variable: "page"
  });

  // change the context and check it emits those events
  const context2 = await launched.browser.newContext();
  await chooser.setContext(context2);

  const page2 = await context2.newPage();
  variables.page2 = page2;
  // workaround since we need to navigate for init script
  await page2.goto("file://" + require.resolve("../fixtures/empty.html"));
  await setBody(page2, "<a>context2</a>");

  events = [];

  await chooser.start();
  await page2.click("a");

  await waitUntil(() => events.length > 1);

  expect(events[1]).toEqual({
    initializeCode: "",
    isActive: true,
    isFillable: false,
    page: page2,
    selectors: [],
    text: "context2",
    variable: "page2"
  });
});
