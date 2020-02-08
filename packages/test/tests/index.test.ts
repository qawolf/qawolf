import { loadEvents, loadWorkflow } from "../";

test("loadEvents loads events", async () => {
  const events = await loadEvents("scroll_login");
  expect(events).toBeTruthy();
});

test("loadWorkflow loads a workflow", async () => {
  const events = await loadWorkflow("scroll_login");
  expect(events).toBeTruthy();
});
