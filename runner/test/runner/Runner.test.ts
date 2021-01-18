import { Environment } from "../../src/environment/Environment";
import { LogArtifactHook } from "../../src/runner/LogArtifactHook";
import { createHooks, Runner } from "../../src/runner/Runner";
import { StatusReporterHook } from "../../src/runner/StatusReporterHook";
import { VideoArtifactsHook } from "../../src/runner/VideoArtifactsHook";

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
});
