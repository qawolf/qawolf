import { setFailed } from "@actions/core";
import { GitHub } from "@actions/github";
import { CONFIG } from "@qawolf/config";
import { createCheckRun, updateCheckRun } from "../src/checkRun";
import { jestResults, jestResultsSinglePassed } from "../fixtures/jestResults";

jest.mock("@actions/core");
jest.mock("@actions/github");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("createCheckRun", () => {
  it("returns created check run id if returned", async () => {
    (GitHub as any).mockImplementation(() => {
      return {
        checks: {
          create: () => {
            return { data: { id: 11 } };
          }
        }
      };
    });

    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubSha = "sha";
    CONFIG.gitHubToken = "secret";

    const checkRunId = await createCheckRun();

    expect(checkRunId).toBe(11);

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubSha = null;
    CONFIG.gitHubToken = null;
  });

  it("calls octokit to create check run for suite", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubSha = "sha";
    CONFIG.gitHubToken = "secret";

    await createCheckRun();

    expect(GitHub).toBeCalledWith("secret");

    const mockInstance = (GitHub as any).mock.instances[0];
    expect(mockInstance.checks.create).toHaveBeenCalledTimes(1);
    const updateArgs = mockInstance.checks.create.mock.calls[0][0];

    expect(updateArgs).toMatchObject({
      head_sha: "sha",
      name: "QA Wolf",
      owner: "qawolf",
      repo: "test",
      status: "in_progress"
    });

    expect(updateArgs.started_at).toBeTruthy();

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubSha = null;
    CONFIG.gitHubToken = null;
  });

  it("sets action to failed if error thrown", async () => {
    (GitHub as any).mockImplementation(() => {
      return {
        checks: {
          create: () => {
            throw new Error("demogorgon!");
          }
        }
      };
    });

    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubSha = "sha";
    CONFIG.gitHubToken = "secret";

    await createCheckRun();
    expect(setFailed).toBeCalledWith("demogorgon!");

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubSha = null;
    CONFIG.gitHubToken = null;
  });

  it("returns null if GitHub repo not specified", async () => {
    CONFIG.gitHubSha = "sha";
    CONFIG.gitHubToken = "secret";

    const checkRunId = await createCheckRun();
    expect(checkRunId).toBeNull();

    CONFIG.gitHubSha = null;
    CONFIG.gitHubToken = null;
  });

  it("returns null if GitHub sha not specified", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubToken = "secret";

    const checkRunId = await createCheckRun();
    expect(checkRunId).toBeNull();

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubToken = null;
  });

  it("returns null if GitHub token not specified", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubSha = "sha";

    const checkRunId = await createCheckRun();
    expect(checkRunId).toBeNull();

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubSha = null;
  });
});

describe("updateCheckRun", () => {
  it("calls octokit to update check run for failed suite", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubToken = "secret";

    await updateCheckRun(11, jestResults);
    expect(GitHub).toBeCalledWith("secret");

    const mockInstance = (GitHub as any).mock.instances[0];
    expect(mockInstance.checks.update).toHaveBeenCalledTimes(1);
    const updateArgs = mockInstance.checks.update.mock.calls[0][0];

    expect(updateArgs).toMatchObject({
      check_run_id: 11,
      conclusion: "failure",
      output: { title: "QA Wolf" },
      owner: "qawolf",
      repo: "test",
      status: "completed"
    });

    expect(updateArgs.completed_at).toBeTruthy();
    expect(updateArgs.output.summary).toBeTruthy();
    expect(setFailed).not.toBeCalled();

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubToken = null;
  });

  it("calls octokit to update check run for passed suite", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubToken = "secret";

    await updateCheckRun(11, jestResultsSinglePassed);
    expect(GitHub).toBeCalledWith("secret");

    const mockInstance = (GitHub as any).mock.instances[0];
    expect(mockInstance.checks.update).toHaveBeenCalledTimes(1);
    const updateArgs = mockInstance.checks.update.mock.calls[0][0];

    expect(updateArgs).toMatchObject({
      check_run_id: 11,
      conclusion: "success",
      output: { title: "QA Wolf" },
      owner: "qawolf",
      repo: "test",
      status: "completed"
    });

    expect(updateArgs.completed_at).toBeTruthy();
    expect(updateArgs.output.summary).toBeTruthy();
    expect(setFailed).not.toBeCalled();

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubToken = null;
  });

  it("sets action to failed if error thrown", async () => {
    (GitHub as any).mockImplementation(() => {
      return {
        checks: {
          update: () => {
            throw new Error("demogorgon!");
          }
        }
      };
    });

    CONFIG.gitHubRepo = "qawolf/test";
    CONFIG.gitHubToken = "secret";

    await updateCheckRun(11, jestResultsSinglePassed);
    expect(setFailed).toBeCalledWith("demogorgon!");

    CONFIG.gitHubRepo = null;
    CONFIG.gitHubToken = null;
  });

  it("throws error if GitHub repo not specified", async () => {
    CONFIG.gitHubToken = "secret";
    const testFn = async () => await updateCheckRun(11, jestResults);
    await expect(testFn()).rejects.toThrowError();

    CONFIG.gitHubToken = null;
  });

  it("throws error if GitHub token not specified", async () => {
    CONFIG.gitHubRepo = "qawolf/test";
    const testFn = async () => await updateCheckRun(11, jestResults);
    await expect(testFn()).rejects.toThrowError();

    CONFIG.gitHubRepo = null;
  });
});
