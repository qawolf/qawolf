import waitUntil from "async-wait-until";
import { Browser } from "playwright";

import { CodeModel } from "../../src/code/FileModel";
import { Environment } from "../../src/environment/Environment";
import { RunOptions, RunProgress } from "../../src/types";
import { FixturesServer, serveFixtures, sleep } from "../utils";

const runOptions: RunOptions = {
  code: "",
  helpers: "",
  restart: true,
};

let environment: Environment;

beforeEach(() => {
  environment = new Environment({ codeModel: new CodeModel() });
});

describe("close", () => {
  it("closes the browser", async () => {
    await environment.run({
      ...runOptions,
      code: "const { browser } = await launch({ headless: true });",
    });

    const browser: Browser = environment._variables.browser;
    expect(browser.isConnected()).toBe(true);
    await environment.close();
    expect(browser.isConnected()).toBe(false);
  });
});

describe("run", () => {
  let server: FixturesServer;

  beforeAll(async () => {
    server = await serveFixtures();
  });

  afterAll(() => server.close());

  it("disables the updater until runs are complete", async () => {
    const runPromise = environment.run({
      ...runOptions,
      code: "",
    });

    expect(environment.updater._enabledAt).toBe(false);
    await runPromise;
    expect(environment.updater._enabledAt).toBeTruthy();

    await environment.close();
  });

  it("emits code as it is updated", async () => {
    let updatedCode = "";

    environment._updater._codeModel.on(
      "codeupdated",
      ({ code }) => (updatedCode = code)
    );

    const code = `const { context } = await launch({ headless: true });\nconst page = await context.newPage();\nawait page.goto("${server.url}/Environment");\n// 🐺 QA Wolf will create code here`;
    environment._updater._codeModel.setValue(code);

    await environment.run({ ...runOptions, code }, []);

    await environment._variables.page.click("button");
    await sleep(0);

    expect(updatedCode).toContain('await page.click("text=Hello");');
    await environment.close();
  });

  it("emits logs", async () => {
    let emitCount = 0;

    environment.on("logscreated", () => {
      emitCount += 1;
    });

    await environment.run({
      ...runOptions,
      code: "console.log('hello'); console.log('world');",
    });

    await waitUntil(() => emitCount === 2);
    expect(emitCount).toEqual(2);

    await environment.close();
  });

  it("emits progress for the current run", async () => {
    const events: RunProgress[] = [];

    environment.on("runprogress", (progress: RunProgress) =>
      events.push(progress)
    );

    // this run is immediately replaced so it should not emit any progress
    environment.run(
      {
        ...runOptions,
        code: "console.log('hello');",
      },
      []
    );

    await environment.run(
      {
        ...runOptions,
        code: "\nconsole.log('world');",
      },
      []
    );

    expect(events.filter((e) => e.code.includes("hello"))).toHaveLength(0);
    expect(events.filter((e) => e.code.includes("world"))).toHaveLength(2);

    await environment.close();
  });

  it("stores variables across runs", async () => {
    const browserVariables = {};

    await environment.run({
      ...runOptions,
      code: 'const x = "hi"; let y = 10; var z = null; y = 11;',
    });

    expect(environment._variables).toMatchObject({
      ...browserVariables,
      x: "hi",
      y: 11,
      z: null,
    });

    await environment.run({
      ...runOptions,
      code: 'const a = !!z; var b = y; let c = x + " there!"',
    });

    expect(environment._variables).toMatchObject({
      ...browserVariables,
      a: false,
      b: 11,
      c: "hi there!",
      x: "hi",
      y: 11,
      z: null,
    });

    await environment.close();
  });
});

describe("stop", () => {
  it("stops runs in progress and enables the updater", async () => {
    const runPromise = environment.run({
      ...runOptions,
      code:
        "await new Promise((r) => setTimeout(r, 100));\nthrow new Error('hello');",
    });

    const run = environment._inProgress[0];

    expect(environment.updater._enabledAt).toBe(false);
    await environment.stop();
    expect(run.stopped).toBe(true);
    expect(environment._inProgress.length).toEqual(0);
    expect(environment.updater._enabledAt).toBeTruthy();

    await runPromise;

    // it should not reach the error
    expect(run.progress.current_line).toEqual(1);
    expect(run.progress.error).toBeUndefined();
  });
});
