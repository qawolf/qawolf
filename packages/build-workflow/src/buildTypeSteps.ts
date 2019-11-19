import {
  keyToCode,
  serializeStrokes,
  stringToStrokes,
  Stroke
} from "@qawolf/browser";
import { Event, Step, KeyEvent, PasteEvent } from "@qawolf/types";
import { isKeyEvent, isPasteEvent } from "@qawolf/web";
import { removePasteKeyEvents } from "./removePasteKeyEvents";

const keyEventToStroke = (event: KeyEvent, index: number): Stroke => {
  const code = keyToCode(event.value);

  if (code) {
    return { index, type: event.name === "keydown" ? "↓" : "↑", value: code };
  }

  return { index, type: "→", value: event.value };
};

export const buildTypeSteps = (allEvents: Event[]) => {
  const steps: Step[] = [];

  const events = removePasteKeyEvents(allEvents);

  let strokes: Stroke[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (isKeyEvent(event)) {
      strokes.push(keyEventToStroke(event as KeyEvent, i));
    } else if (isPasteEvent(event)) {
      strokes = strokes.concat(stringToStrokes((event as PasteEvent).value));
    } else if (strokes.length) {
      steps.push({
        action: "type",
        // include event index so we can sort in buildSteps
        index: i,
        pageId: event.pageId,
        target: event.target,
        value: serializeStrokes(strokes)
      });

      strokes = [];
    }

    // TODO separate Enter/Tab steps -- and include them
  }

  if (strokes.length) {
    steps.push({
      action: "type",
      // include event index so we can sort in buildSteps
      index: events.length,
      pageId: events[events.length - 1].pageId,
      target: events[events.length - 1].target,
      value: serializeStrokes(strokes)
    });
  }

  return steps;
};
