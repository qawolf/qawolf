// Xvfb :0 -screen 0 1288x804x24 -listen tcp &
// DEBUG=qawolf* npm run test Runner.test.ts
import { promises as fs } from "fs";

import { Environment } from "../../src/environment/Environment";
import { LogArtifactHook } from "../../src/runner/LogArtifactHook";
import { createHooks, Runner } from "../../src/runner/Runner";
import { StatusReporterHook } from "../../src/runner/StatusReporterHook";
import { VideoArtifactsHook } from "../../src/runner/VideoArtifactsHook";
import { RunProgress } from "../../src/types";

describe("createHooks", () => {
  const artifacts = {
    gifUrl: "gifUrl",
    jsonUrl: "jsonUrl",
    logsUrl: "logsUrl",
    videoUrl: "videoUrl",
  };

  const environment = new Environment();

  afterAll(() => environment.close());

  it("includes artifact hooks if specified", () => {
    const hooks = createHooks(
      {
        artifacts,
        code: "code",
        helpers: "",
        restart: false,
        test_id: "",
      },
      environment
    );

    expect(hooks).toEqual([
      expect.any(LogArtifactHook),
      expect.any(VideoArtifactsHook),
    ]);
  });

  it("includes status reporter hook if specified", () => {
    const hooks = createHooks(
      {
        code: "code",
        helpers: "",
        restart: false,
        run_id: "runId",
        test_id: "",
      },
      environment
    );

    expect(hooks).toEqual([expect.any(StatusReporterHook)]);
  });
});

describe("Runner", () => {
  const code = 'console.log("hello")';

  let runner: Runner;

  beforeAll(() => {
    runner = new Runner();
  });

  afterAll(() => runner.close());

  it("runs code", async () => {
    let progress: RunProgress | undefined;
    runner.on("runprogress", (value) => (progress = value));

    await runner.run({
      code,
      helpers: "",
      restart: false,
      test_id: "",
    });

    expect(progress).toMatchObject({
      code,
      completed_at: expect.any(String),
      current_line: 1,
      status: "pass",
    });
  });

  it("creates a new environment on restart", async () => {
    const initialEnvironment = runner._environment;

    await runner.run({
      code,
      helpers: "",
      restart: true,
      test_id: "",
    });

    expect(initialEnvironment === runner._environment).toBe(false);
  });

  it("saves a JSON file with code line metadata", async () => {
    const multiLineCode = `console.log("Line 1");
await new Promise((r) => setTimeout(r, 500));
console.log("Line 3");
console.log("Line 4");
`;

    await runner.run({
      artifacts: {
        gifUrl: "local-only",
        jsonUrl: "local-only",
        logsUrl: "local-only",
        videoUrl: "local-only",
      },
      code: multiLineCode,
      helpers: "",
      restart: true,
      test_id: "",
    });

    const videoHook = runner._hooks[1] as VideoArtifactsHook;

    await videoHook.waitForUpload();
    const videoMetadataJSON = await fs.readFile(
      videoHook._videoCapture._jsonPath,
      "utf8"
    );
    const videoMetadata = JSON.parse(videoMetadataJSON);

    expect(videoMetadata.markers).toEqual([
      {
        lineCode: 'console.log("Line 1");',
        lineNum: 1,
        startTime: expect.any(Number),
      },
      {
        lineCode: "await new Promise((r) => setTimeout(r, 500));",
        lineNum: 2,
        startTime: expect.any(Number),
      },
      {
        lineCode: 'console.log("Line 3");',
        lineNum: 3,
        startTime: expect.any(Number),
      },
      {
        lineCode: 'console.log("Line 4");',
        lineNum: 4,
        startTime: expect.any(Number),
      },
    ]);

    expect(Array.isArray(videoMetadata.timings)).toBe(true);
    expect(videoMetadata.timings.length).toBeGreaterThan(0);

    // Exact start times and frames will vary, but we can do some simple sanity checks
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [marker1, marker2, marker3] = videoMetadata.markers!;

    expect(marker1.startTime).toBeLessThanOrEqual(marker2.startTime);
    expect(marker2.startTime).toBeLessThanOrEqual(marker3.startTime);
  });

  it("reports a navigation error", async () => {
    const runner = new Runner();

    let progress: RunProgress | undefined;
    runner.on("runprogress", (value) => (progress = value));

    await runner.run({
      code: `const { browser, context } = await launch({ headless: true });
const page = await context.newPage();
await page.goto("http://localhost:1001");
`,
      helpers: "",
      restart: true,
      test_id: "",
    });

    // keep this error format in sync with updateRun since we use it to determine retries
    expect(
      progress?.error?.startsWith("page.goto: net::ERR_CONNECTION_REFUSED")
    ).toBe(true);

    // give enough time for bindings to be exposed before closing
    // or playwright throws Protocol error (Runtime.addBinding): Target closed
    await new Promise((r) => setTimeout(r, 1000));

    await runner.close();
  });

  it("starts and stops an element chooser", async () => {
    const runner = new Runner();

    let events: string[] = [];

    runner._environment = {
      elementChooser: {
        start() {
          events.push("elementChooser.start");
        },
        stop() {
          events.push("elementChooser.stop");
        },
      },
      updater: {
        enable() {
          events.push("updater.enable");
        },
        disable() {
          events.push("updater.disable");
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    runner.startElementChooser();
    expect(events).toEqual(["updater.disable", "elementChooser.start"]);

    events = [];
    runner.stopElementChooser();
    expect(events).toEqual(["elementChooser.stop", "updater.enable"]);
  });
});
