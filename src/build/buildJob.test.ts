import { loadEvents } from "@qawolf/fixtures";
import { buildJob, findUrl } from "./buildJob";
import { finalSteps } from "./buildSteps.test";

describe("findUrl", () => {
  test("finds starting url of events", async () => {
    const events = await loadEvents("login");

    expect(findUrl(events)).toBe("http://localhost:5000/");
  });
});

describe("buildJob", () => {
  test("creates a job from events", async () => {
    const events = await loadEvents("login");
    const job = buildJob(events, "test job");

    expect(job).toMatchObject({
      name: "test job",
      steps: finalSteps,
      url: "http://localhost:5000/"
    });
  });
});
