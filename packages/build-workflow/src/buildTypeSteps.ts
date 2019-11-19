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

// TODO refactor this eww code
export const buildTypeSteps = (allEvents: Event[]) => {
  const steps: Step[] = [];

  const events = removePasteKeyEvents(allEvents);

  let strokes: Stroke[] = [];

  const buildTypeStep = (event: Event) => {
    if (!strokes.length) return;

    steps.push({
      action: "type",
      // include event index so we can sort in buildSteps
      index: events.indexOf(event),
      pageId: event.pageId,
      target: event.target,
      value: serializeStrokes(strokes)
    });

    strokes = [];
  };

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (isKeyEvent(event)) {
      const keyEvent = event as KeyEvent;

      if (keyEvent.value === "Enter" || keyEvent.value === "Tab") {
        // ignore keyup
        if (keyEvent.name === "keyup") continue;

        // build the previous strokes as a separate step
        if (i > 0) {
          buildTypeStep(events[i - 1]);
        }

        strokes = [
          {
            index: 0,
            type: "↓",
            value: keyEvent.value
          },
          {
            index: 1,
            type: "↑",
            value: keyEvent.value
          }
        ];

        buildTypeStep(keyEvent);
      } else {
        strokes.push(keyEventToStroke(keyEvent, i));
      }
    } else if (isPasteEvent(event)) {
      strokes = strokes.concat(stringToStrokes((event as PasteEvent).value));
    } else if (strokes.length) {
      buildTypeStep(event);
    }
  }

  buildTypeStep(events[events.length - 1]);

  return steps;
};
