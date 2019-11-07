import { loadEvents } from "@qawolf/fixtures";
import { Event, PasteEvent, KeyEvent } from "@qawolf/types";
import {
  buildKeyEvents,
  findPasteKeyEvents,
  replacePasteEvents
} from "../src/replacePasteEvents";

let events: Event[];

beforeAll(async () => {
  events = await loadEvents("paste");
});

describe("buildKeyEvents", () => {
  it("builds key events for a paste event", () => {
    const keyEvents = buildKeyEvents({
      isTrusted: true,
      name: "paste",
      target: {},
      time: 0,
      value: "Hey!"
    });

    expect(
      keyEvents.map(k => `${k.name === "keydown" ? "↓" : "↑"}${k.value}`)
    ).toEqual([
      "↓Shift",
      "↓KeyH",
      "↑KeyH",
      "↑Shift",
      "↓KeyE",
      "↑KeyE",
      "↓KeyY",
      "↑KeyY",
      "↓Shift",
      "↓Digit1",
      "↑Digit1",
      "↑Shift"
    ]);
  });
});

describe("findPasteKeyEvents", () => {
  it("finds matching paste events", () => {
    const pasteIndex1 = events.findIndex(e => e.name === "paste");
    const pasteIndex2 = events.findIndex(
      (e, index) => index > pasteIndex1 && e.name === "paste"
    );

    const pasteEvents1 = findPasteKeyEvents(events, pasteIndex1);
    expect(pasteEvents1.map(e => e.time)).toEqual([
      1573155008974,
      1573155009100,
      1573155009219,
      1573155009218
    ]);

    const pasteEvents2 = findPasteKeyEvents(events, pasteIndex2);
    expect(pasteEvents2.map(e => e.time)).toEqual([
      1573155014683,
      1573155014815,
      1573155014894,
      1573155014894
    ]);
  });
});

describe("replacePasteEvents", () => {
  it("replaces CMD+V shortcuts with key events", () => {
    const replacedEvents = replacePasteEvents(events);
    expect(
      replacedEvents
        .filter(e => e.name === "keydown" || e.name === "keyup")
        .map(e => `${e.name === "keydown" ? "↓" : "↑"}${(e as KeyEvent).value}`)
    ).toMatchSnapshot();
  });
});
