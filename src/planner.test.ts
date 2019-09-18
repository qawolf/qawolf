import fs from "fs-extra";
import { eventWithTime } from "rrweb/typings/types";
import { findHref } from "./planner";

let events: eventWithTime[];

beforeAll(async () => {
  // XXX turn into helper in qawolf-fixtures
  const json = await fs.readFile(
    "node_modules/@jperl/qawolf-fixtures/events/google_search.events",
    "utf8"
  );
  events = JSON.parse(json);
});

test("findHref finds the href from events", async () => {
  const href = findHref(events);
  expect(href).toEqual("https://www.google.com/");
});
