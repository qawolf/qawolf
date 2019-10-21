import { loadEvents } from "@qawolf/fixtures";
import { loginWorkflow } from "../fixtures/loginWorkflow";
import { buildWorkflow, findUrl } from "../src/buildWorkflow";

describe("findUrl", () => {
  it("finds starting url of events", async () => {
    const events = await loadEvents("login");

    expect(findUrl(events)).toBe("http://localhost:5000/");
  });
});

describe("buildWorkflow", () => {
  it("creates a workflow from events", async () => {
    const events = await loadEvents("login");
    const workflow = buildWorkflow(events, "login");
    expect(workflow).toMatchObject(loginWorkflow);
  });
});
