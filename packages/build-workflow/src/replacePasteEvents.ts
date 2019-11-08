import { buildStrokesForString } from "@qawolf/browser";
import { Event, KeyEvent, PasteEvent } from "@qawolf/types";
import { find, findLast, remove } from "lodash";

export const buildKeyEvents = (event: PasteEvent): KeyEvent[] => {
  const strokes = buildStrokesForString(event.value);

  const keyEvents = strokes.map<KeyEvent>(stroke => ({
    isTrusted: true,
    name: stroke.prefix === "↓" ? "keydown" : "keyup",
    pageId: event.pageId,
    target: event.target,
    time: event.time,
    value: stroke.code
  }));

  return keyEvents;
};

export const findPasteKeyEvents = (events: Event[], pasteIndex: number) => {
  const downCmd = findLast(
    events,
    (event, eventIndex) =>
      eventIndex < pasteIndex &&
      event.name === "keydown" &&
      ((event as KeyEvent).value.startsWith("Meta") ||
        (event as KeyEvent).value.startsWith("Control"))
  );

  const downV = findLast(
    events,
    (event, eventIndex) =>
      eventIndex < pasteIndex &&
      event.name === "keydown" &&
      (event as KeyEvent).value == "KeyV"
  );

  const upCmd = find(
    events,
    (event, eventIndex) =>
      eventIndex > pasteIndex &&
      event.name === "keyup" &&
      ((event as KeyEvent).value.startsWith("Meta") ||
        (event as KeyEvent).value.startsWith("Control"))
  );

  const upV = find(
    events,
    (event, eventIndex) =>
      eventIndex > pasteIndex &&
      event.name === "keyup" &&
      (event as KeyEvent).value == "KeyV"
  );

  if (!downCmd || !downV) {
    throw new Error("Could not find matching paste shortcut");
  }

  return [downCmd, downV, upV, upCmd].filter(e => e);
};

export const replacePasteEvents = (events: Event[]) => {
  // replace paste with key events
  const replacedEvents = events.slice(0);

  replacedEvents.forEach((event, index) => {
    if (event.name !== "paste") return;

    const pasteKeyEvents = findPasteKeyEvents(replacedEvents, index);
    remove(replacedEvents, e => !!pasteKeyEvents.includes(e));
  });

  for (let i = 0; i < replacedEvents.length; i++) {
    const event = replacedEvents[i];
    if (event.name !== "paste") continue;

    const keyEventsToInsert = buildKeyEvents(event as PasteEvent);
    replacedEvents.splice(i, 0, ...keyEventsToInsert);
    i += keyEventsToInsert.length;
  }

  return replacedEvents;
};
