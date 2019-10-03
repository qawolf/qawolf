import { loadEvents } from "@qawolf/fixtures";
import { finalSteps } from "./eventsToSteps.test";
import { findHref, planJob } from "./planner";

describe("findHref", () => {
  test("returns href of events", async () => {
    const events = await loadEvents("login");

    expect(findHref(events)).toBe("http://localhost:5000/");
  });
});

describe("planJob", () => {
  test("returns job for events", async () => {
    const events = await loadEvents("login");

    const job = planJob(events, "test job");

    expect(job).toMatchObject({
      name: "test job",
      steps: finalSteps,
      url: "http://localhost:5000/"
    });
  });
});
