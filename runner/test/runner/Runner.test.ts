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
        version: 1,
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
        version: 1,
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
      version: 1,
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
      version: 1,
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
      version: 1,
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
        startFrame: expect.any(Number),
        startTimeAbsolute: expect.any(Number),
        startTimeRelative: expect.any(Number),
      },
      {
        lineCode: "await new Promise((r) => setTimeout(r, 500));",
        lineNum: 2,
        startFrame: expect.any(Number),
        startTimeAbsolute: expect.any(Number),
        startTimeRelative: expect.any(Number),
      },
      {
        lineCode: 'console.log("Line 3");',
        lineNum: 3,
        startFrame: expect.any(Number),
        startTimeAbsolute: expect.any(Number),
        startTimeRelative: expect.any(Number),
      },
      {
        lineCode: 'console.log("Line 4");',
        lineNum: 4,
        startFrame: expect.any(Number),
        startTimeAbsolute: expect.any(Number),
        startTimeRelative: expect.any(Number),
      },
    ]);

    expect(Array.isArray(videoMetadata.timings)).toBe(true);
    expect(videoMetadata.timings.length).toBeGreaterThan(0);

    // Exact start times and frames will vary, but we can do some simple sanity checks
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [marker1, marker2, marker3] = videoMetadata.markers!;

    expect(marker1.startTimeAbsolute).toBeLessThanOrEqual(
      marker2.startTimeAbsolute
    );
    expect(marker2.startTimeAbsolute).toBeLessThanOrEqual(
      marker3.startTimeAbsolute
    );
    expect(marker1.startTimeRelative).toBeLessThanOrEqual(
      marker2.startTimeRelative
    );
    expect(marker2.startTimeRelative).toBeLessThanOrEqual(
      marker3.startTimeRelative
    );
    expect(marker1.startFrame).toBeGreaterThanOrEqual(1);
    expect(marker1.startFrame).toBeLessThanOrEqual(marker2.startFrame);
    expect(marker2.startFrame).toBeLessThanOrEqual(marker3.startFrame);
  });
});
