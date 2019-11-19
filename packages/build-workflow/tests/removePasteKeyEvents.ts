import { loadEvents } from "@qawolf/fixtures";
import { Event, KeyEvent } from "@qawolf/types";
import {
  findPasteKeyEvents,
  removePasteKeyEvents
} from "../src/removePasteKeyEvents";

let events: Event[];

beforeAll(async () => {
  events = await loadEvents("paste");
});

describe("findPasteKeyEvents", () => {
  it("finds matching paste events", () => {
    const pasteIndex1 = events.findIndex(e => e.name === "paste");
    const pasteIndex2 = events.findIndex(
      (e, index) => index > pasteIndex1 && e.name === "paste"
    );

    const pasteEvents1 = findPasteKeyEvents(events, pasteIndex1);
    expect(pasteEvents1.map(e => e!.time)).toEqual([
      1573155008974,
      1573155009100,
      1573155009219,
      1573155009218
    ]);

    const pasteEvents2 = findPasteKeyEvents(events, pasteIndex2);
    expect(pasteEvents2.map(e => e!.time)).toEqual([
      1573155014683,
      1573155014815,
      1573155014894,
      1573155014894
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
