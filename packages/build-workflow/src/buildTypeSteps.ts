import {
  convertPressesToStrokes,
  Press,
  serializeStrokes
} from "@qawolf/browser";
import { Event, KeyEvent, Step } from "@qawolf/types";
import { isKeyEvent } from "@qawolf/web";
import { replacePasteEvents } from "./replacePasteEvents";

export const convertEventsToPresses = (events: Event[]): Press[] => {
  const presses: Press[] = [];

  events.forEach((e, index) => {
    if (!isKeyEvent(e)) return;

    const event = e as KeyEvent;
    if (event.name === "keydown") {
      // create a new press per keydown
      presses.push({
        code: event.value,
        downEvent: event,
        downEventIndex: index,
        upEventIndex: null,
        xpath: e.target.xpath!
      });
    } else {
      // match keyup with it's corresponding press
      const press = presses.find(
        s => s.code === event.value && s.upEventIndex === null
      )!;
      press.upEventIndex = index;
    }
  });

  return presses;
};

export const buildTypeSteps = (originalEvents: Event[]) => {
  const events = replacePasteEvents(originalEvents);
  const presses = convertEventsToPresses(events);

  const steps: Step[] = [];

  // group consecutive presses per action
  let stepPresses: Press[] = [];

  for (let i = 0; i < presses.length; i++) {
    const press = presses[i];
    stepPresses.push(press);

    const nextPress = i + 1 < presses.length ? presses[i + 1] : null;

    // check the next press does not have another action in-between
    const nextPressIsConsecutive =
      nextPress && isKeyEvent(events[nextPress.downEventIndex - 1]);

    const shouldBuildStep =
      !nextPressIsConsecutive ||
      press.xpath !== nextPress!.xpath ||
      nextPress!.code === "Enter" ||
      nextPress!.code === "Tab";

    if (shouldBuildStep) {
      const event = stepPresses[0].downEvent;
      const strokes = convertPressesToStrokes(stepPresses);

      steps.push({
        action: "type",
        // include event index so we can sort in buildSteps
        index: stepPresses[0].downEventIndex,
        pageId: event.pageId,
        target: event.target,
        value: serializeStrokes(strokes)
      });

      stepPresses = [];
    }
  }

  return steps;
};
