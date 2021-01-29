// Xvfb :0 -screen 0 1288x804x24 -listen tcp &
// DEBUG=qawolf* npm run test Runner.test.ts
import { Environment } from "../../src/environment/Environment";
import { LogArtifactHook } from "../../src/runner/LogArtifactHook";
import { createHooks, Runner } from "../../src/runner/Runner";
import { StatusReporterHook } from "../../src/runner/StatusReporterHook";
import { VideoArtifactsHook } from "../../src/runner/VideoArtifactsHook";
import { probeVideoFile } from "../../src/services/ffprobe";

describe("createHooks", () => {
  const artifacts = {
    gifUrl: "gifUrl",
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
    const progress = await runner.run({
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

  it("saves a video of the run with step chapter metadata", async () => {
    const multiLineCode = `console.log("Line 1");
console.log("Line 2");`;

    await runner.run({
      artifacts: {
        gifUrl: "local-only",
        logsUrl: "logsUrl",
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
    const videoMetadata = await probeVideoFile(
      videoHook._videoCapture.videoWithMetadataPath,
      {
        showChapters: true,
      }
    );

    expect(videoMetadata).toEqual({
      chapters: [
        {
          end: expect.any(Number),
          end_time: expect.any(String),
          id: 0,
          start: expect.any(Number),
          start_time: expect.any(String),
          tags: {
            title: 'console.log("Line 1");',
          },
          time_base: "1/1000",
        },
        {
          end: expect.any(Number),
          end_time: expect.any(String),
          id: 1,
          start: expect.any(Number),
          start_time: expect.any(String),
          tags: {
            title: 'console.log("Line 2");',
          },
          time_base: "1/1000",
        },
      ],
    });

    // Exact start and end times will vary, but we can do some simple sanity checks
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [chapter1, chapter2] = videoMetadata.chapters!;

    expect(chapter1.end).toBe(chapter2.start);
    expect(chapter1.end_time).toBe(chapter2.start_time);
    expect(chapter1.start).toBeLessThan(chapter2.start);
    expect(chapter1.start).toBeLessThan(chapter1.end);
    expect(chapter2.start).toBeLessThan(chapter2.end);
  });
});
