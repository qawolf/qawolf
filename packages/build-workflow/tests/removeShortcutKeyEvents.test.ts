import { loadEvents } from "@qawolf/test";
import { ElementEvent, KeyEvent } from "@qawolf/types";
import {
  findShortcutKeyEvents,
  removeShortcutKeyEvents
} from "../src/removeShortcutKeyEvents";

let events: ElementEvent[];

beforeAll(async () => {
  events = await loadEvents("scroll_login");
});

describe("findShortcutKeyEvents", () => {
  it("finds matching paste events", () => {
    const pasteIndex = events.findIndex(e => e.name === "paste");
    const pasteEvents = findShortcutKeyEvents("v", events, pasteIndex);
    expect(pasteEvents.map(e => e!.time)).toEqual([
      1575828034561,
      1575828034757,
      1575828034900,
      1575828034899
    ]);
  });
});

describe("removeShortcutKeyEvents", () => {
  it("removes CMD+V key events", () => {
    const replacedEvents = removeShortcutKeyEvents("paste", events);
    expect(
      replacedEvents
        .filter(e => e.name === "keydown" || e.name === "keyup")
        .map(e => `${e.name === "keydown" ? "↓" : "↑"}${(e as KeyEvent).value}`)
    ).toMatchSnapshot();
  });
});
