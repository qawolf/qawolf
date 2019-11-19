import { Event, KeyEvent } from "@qawolf/types";
import { find, findLast, remove } from "lodash";

const isControlEvent = (event: KeyEvent) => {
  return event.value.startsWith("Meta") || event.value.startsWith("Control");
};

export const findPasteKeyEvents = (events: Event[], pasteIndex: number) => {
  const downCmd = findLast(
    events,
    (event, eventIndex) =>
      eventIndex < pasteIndex &&
      event.name === "keydown" &&
      isControlEvent(event as KeyEvent)
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
      isControlEvent(event as KeyEvent)
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

export const removePasteKeyEvents = (events: Event[]) => {
  const filteredEvents = events.slice(0);

  // find the matching paste key events per paste and remove them
  filteredEvents.forEach((event, index) => {
    if (event.name !== "paste") return;

    const pasteKeyEvents = findPasteKeyEvents(filteredEvents, index);
    remove(filteredEvents, e => pasteKeyEvents.includes(e));
  });

  return filteredEvents;
};
