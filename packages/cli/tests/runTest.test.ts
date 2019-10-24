import { runTest } from "../src/runTest";

describe("runTest", () => {
  it("returns results from successful test", async () => {
    const results = await runTest("success");

    expect(results.numFailedTests).toBe(0);
    expect(results.numPassedTests).toBe(3);
    expect(results.numPendingTests).toBe(0);

    expect(results.testResults[0].testResults).toMatchObject([
      { status: "passed", title: "step 1" },
      { status: "passed", title: "step 2" },
      { status: "passed", title: "step 3" }
    ]);
  });

  it("returns results from failed test", async () => {
    const results = await runTest("failure");

    expect(results.numFailedTests).toBe(1);
    expect(results.numPassedTests).toBe(2);
    expect(results.numPendingTests).toBe(1);

    expect(results.testResults[0].testResults).toMatchObject([
      { status: "passed", title: "step 1" },
      { status: "passed", title: "step 2" },
      { status: "failed", title: "step 3" },
      { status: "pending", title: "step 4" }
    ]);

    expect(results.testResults[0].testResults[2].failureMessages[0]).toContain(
      "demogorgon!"
    );
  });

  it("returns results when running multiple tests", async () => {
    const results = await runTest("u");

    expect(results.numFailedTests).toBe(1);
    expect(results.numPassedTests).toBe(5);
    expect(results.numPendingTests).toBe(1);

    const failureResults = results.testResults.find(result =>
      result.testFilePath.includes("failure")
    );
    const successResults = results.testResults.find(result =>
      result.testFilePath.includes("success")
    );

    expect(failureResults!.testResults).toMatchObject([
      { status: "passed", title: "step 1" },
      { status: "passed", title: "step 2" },
      { status: "failed", title: "step 3" },
      { status: "pending", title: "step 4" }
    ]);

    expect(successResults!.testResults).toMatchObject([
      { status: "passed", title: "step 1" },
      { status: "passed", title: "step 2" },
      { status: "passed", title: "step 3" }
    ]);
  });
});
