import { runJest } from "../src/runJest";

it("runs successful test", async () => {
  runJest(["success"]);
});

it("ignores error for failed test", async () => {
  runJest(["failure"]);
});
