import { loadEvents } from "@qawolf/fixtures";
import { Event, KeyEvent } from "@qawolf/types";
import {
  findPasteKeyEvents,
  removePasteKeyEvents
} from "../src/removePasteKeyEvents";

let events: Event[];

beforeAll(async () => {
  events = await loadEvents("scroll_login");
});

describe("findPasteKeyEvents", () => {
  it("finds matching paste events", () => {
    const pasteIndex1 = events.findIndex(e => e.name === "paste");

    const pasteEvents1 = findPasteKeyEvents(events, pasteIndex1);
    expect(pasteEvents1.map(e => e!.time)).toEqual([
      1575139331183,
      1575139331642,
      1575139331783,
      1575139331783
    ]);
  });
});

describe("removePasteKeyEvents", () => {
  it("removes CMD+V key events", () => {
    const replacedEvents = removePasteKeyEvents(events);
    expect(
      replacedEvents
        .filter(e => e.name === "keydown" || e.name === "keyup")
        .map(e => `${e.name === "keydown" ? "↓" : "↑"}${(e as KeyEvent).value}`)
    ).toMatchSnapshot();
  });
});
