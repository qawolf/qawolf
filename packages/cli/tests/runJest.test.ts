import { runJest } from "../src/runJest";

it("runs successful test", async () => {
  const exitCode = runJest(["success"], {});
  expect(exitCode).toEqual(0);
});

it("ignores error for failed test", async () => {
  const exitCode = runJest(["failure"], {});
  expect(exitCode).toEqual(1);
});
