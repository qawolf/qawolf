import waitUntil from "async-wait-until";
import { Browser } from "playwright";

import { Environment } from "../../src/environment/Environment";
import { RunOptions, RunProgress } from "../../src/types";
import { TEST_URL } from "../utils";

const runOptions: RunOptions = {
  code: "",
  restart: true,
  test_id: "",
  version: 0,
};

describe("Environment", () => {
  it("closes the browser when close is called", async () => {
    const environment = new Environment();
    await environment.run({
      ...runOptions,
      code: "const { browser } = await launch({ headless: true });",
    });

    const browser: Browser = environment._variables.browser;
    expect(browser.isConnected()).toBe(true);
    await environment.close();
    expect(browser.isConnected()).toBe(false);
  });

  it("disables the updater while runs are in progress", async () => {
    const environment = new Environment();

    const runPromise = environment.run({
      ...runOptions,
      code: "",
    });

    expect(environment.updater._enabled).toBe(false);
    await runPromise;
    expect(environment.updater._enabled).toBe(true);

    await environment.close();
  });

  it("emits code as it is updated", async () => {
    const environment = new Environment();

    let updatedCode = "";
    environment.on("codeupdated", ({ code }) => (updatedCode = code));

    await environment.run(
      {
        ...runOptions,
        code: `const { context } = await launch({ headless: true });\nconst page = await context.newPage();\nawait page.goto("${TEST_URL}");\n// 🐺 create code here`,
      },
      []
    );

    await environment._variables.page.click("a");
    expect(updatedCode).toContain('await page.click("text=Buttons");');
    await environment.close();
  });

  it("emits logs", async () => {
    const environment = new Environment();

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
    const environment = new Environment();
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
    expect(events.filter((e) => e.code.includes("world"))).toHaveLength(3);

    await environment.close();
  });

  it("stores variables across runs", async () => {
    const environment = new Environment();

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
