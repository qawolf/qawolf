import { Event, KeyEvent, Step } from "@qawolf/types";

// A Press is the pair of corresponding down and up key events
type Press = {
  code: string;
  downEvent: Event;
  downEventIndex: number;
  upEventIndex: number | null;
  xpath: string;
};

type Stroke = {
  code: string;
  index: number;
  prefix: string;
};

const isKeyEvent = (event: Event | null) =>
  event &&
  event.isTrusted &&
  (event.name === "keydown" || event.name === "keyup");

export const pairKeyEvents = (events: Event[]): Press[] => {
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

const buildTypeValue = (presses: Press[]) => {
  const strokes: Stroke[] = [];

  presses.forEach(p => {
    strokes.push({ code: p.code, index: p.downEventIndex, prefix: "↓" });

    if (p.upEventIndex !== null) {
      strokes.push({ code: p.code, index: p.upEventIndex, prefix: "↑" });
    }
  });

  return strokes
    .sort((a, b) => a.index - b.index)
    .map(s => `${s.prefix}${s.code}`)
    .join("");
};

export const buildTypeSteps = (events: Event[]) => {
  const presses = pairKeyEvents(events);

  const steps: Step[] = [];

  // group consecutive keystrokes to one action
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

      steps.push({
        action: "type",
        // include event index so we can sort in buildSteps
        index: stepPresses[0].downEventIndex,
        pageId: event.pageId,
        target: event.target,
        value: buildTypeValue(stepPresses)
      });

      stepPresses = [];
    }
  }

  return steps;
};
