import { Environment } from "../../src/environment/Environment";
import { Run } from "../../src/environment/Run";
import { RunOptions, RunProgress } from "../../src/types";

const runOptions: RunOptions = {
  code: "",
  helpers: "",
  restart: true,
  test_id: "",
  version: 0,
};

describe("Run", () => {
  const environment = new Environment();

  afterAll(() => environment.close());

  it("catches and formats the error", async () => {
    const run = new Run({
      logger: environment._logger,
      runOptions: {
        ...runOptions,
        code: "throw new Error('oh no!');",
      },
      vm: environment._vm,
    });

    await run.run({}, []);
    expect(run._progress.error).toEqual(
      "Error: oh no!\n    at qawolfTest (vm.js:7:7)"
    );
  });

  it("emits progress", async () => {
    const events: RunProgress[] = [];

    const code = "const a = 0;\nconst b = 1;";

    const run = new Run({
      logger: environment._logger,
      runOptions: {
        ...runOptions,
        code,
      },
      vm: environment._vm,
    });

    run.on("runprogress", (progress: RunProgress) => events.push(progress));

    await run.run({}, []);

    const event = {
      code,
      completed_at: null,
      current_line: 1,
      run_id: undefined,
      start_line: undefined,
      status: "created",
      test_id: "",
    };

    expect(events).toEqual([
      event,
      {
        ...event,
        current_line: 2,
      },
      {
        ...event,
        completed_at: expect.any(String),
        current_line: 2,
        status: "pass",
      },
    ]);
  });

  it("includes helpers", async () => {
    const events: RunProgress[] = [];

    const code = "const b = 1;\na+b";

    const run = new Run({
      logger: environment._logger,
      runOptions: {
        ...runOptions,
        code,
        helpers: "const a = 2;",
      },
      vm: environment._vm,
    });

    run.on("runprogress", (progress: RunProgress) => events.push(progress));

    await run.run({}, []);

    const event = {
      code,
      completed_at: null,
      current_line: 1,
      run_id: undefined,
      start_line: undefined,
      status: "created",
      test_id: "",
    };

    expect(events).toEqual([
      event,
      {
        ...event,
        current_line: 2,
      },
      {
        ...event,
        completed_at: expect.any(String),
        current_line: 2,
        status: "pass",
      },
    ]);
  });

  it("runs hooks", async () => {
    const run = new Run({
      logger: environment._logger,
      runOptions: {
        ...runOptions,
        code: "await new Promise((r) => setTimeout(r, 0))",
      },
      vm: environment._vm,
    });

    let before = 0;
    let after = 0;

    const hook = {
      async before() {
        before += 1;
      },
      async after() {
        after += 1;
      },
    };

    const promise = run.run({}, [hook, hook]);
    expect(before).toEqual(2);
    expect(after).toEqual(0);

    await promise;

    expect(before).toEqual(2);
    expect(after).toEqual(2);
  });

  it("stop prevents it from running more lines", async () => {
    const events: RunProgress[] = [];

    const run = new Run({
      logger: environment._logger,
      runOptions: {
        ...runOptions,
        code:
          "await new Promise((r) => setTimeout(r, 50));\nthrow new Error('should not reach here')",
      },
      vm: environment._vm,
    });

    run.on("runprogress", (progress: RunProgress) => events.push(progress));

    const promise = run.run({}, []);
    // give it enough time to run the first line
    // but not enough to run the second line
    await new Promise((r) => setTimeout(r, 0));
    run.stop();

    await promise;

    expect(run.progress.error).toBeUndefined();
    expect(run.progress).toMatchObject({
      completed_at: expect.any(String),
    });
  });
});
