import {
  characterToCode,
  serializeStrokes,
  stringToStrokes,
  Stroke,
  StrokeType
} from "@qawolf/browser";
import { Event, Step, KeyEvent, PasteEvent } from "@qawolf/types";
import { isKeyEvent, isPasteEvent } from "@qawolf/web";
import { removePasteKeyEvents } from "./removePasteKeyEvents";

const SEPARATE_KEYS = ["Enter", "Tab"];

export class TypeStepFactory {
  private events: Event[];

  private steps: Step[] = [];

  // the event of the first pending Stroke
  private pendingEvent: Event | null = null;
  private pendingStrokes: Stroke[] = [];

  constructor(events: Event[]) {
    this.events = events;
  }

  buildPendingStrokesStep() {
    /**
     * Build a type step for pending strokes.
     */
    if (!this.pendingStrokes.length) return;
    if (!this.pendingEvent) throw new Error("pendingEvent not set");

    const event = this.pendingEvent;

    this.steps.push({
      action: "type",
      html: event.target,
      // include event index so we can sort in buildSteps
      index: this.events.indexOf(event),
      page: event.page,
      value: serializeStrokes(this.pendingStrokes)
    });

    this.pendingEvent = null;
    this.pendingStrokes = [];
  }

  buildSeparateStep(event: KeyEvent, index: number) {
    // ignore keyup event we build the separate step for the keydown
    // and include the up stroke as part of it
    if (event.name === "keyup") return;

    this.buildPendingStrokesStep();

    this.pendingEvent = event;
    this.pendingStrokes = ["↓", "↑"].map((type: StrokeType) => ({
      index,
      type,
      value: event.value
    }));
    this.buildPendingStrokesStep();
  }

  buildKeyStroke(event: KeyEvent, index: number) {
    if (SEPARATE_KEYS.some(special => event.value === special)) {
      this.buildSeparateStep(event, index);
      return;
    }

    const code = characterToCode(event.value);
    let type: StrokeType = event.name === "keydown" ? "↓" : "↑";
    if (!code) {
      // sendCharacter if we cannot find the key's code
      type = "→";
    }

    if (!this.pendingEvent) this.pendingEvent = event;

    this.pendingStrokes.push({
      index,
      type,
      value: code ? code : event.value
    });
  }

  buildPasteStrokes(event: PasteEvent, index: number) {
    const strokes = stringToStrokes(event.value);
    if (!this.pendingEvent) this.pendingEvent = event;

    strokes.forEach(stroke => {
      this.pendingStrokes.push({
        ...stroke,
        index
      });
    });
  }

  buildSteps() {
    const filteredEvents = removePasteKeyEvents(this.events);

    filteredEvents.forEach(event => {
      // find the index from the unfiltered list
      const index = this.events.indexOf(event);

      if (this.pendingEvent && event.page !== this.pendingEvent.page) {
        // build the step when the page changes
        this.buildPendingStrokesStep();
      }

      if (isPasteEvent(event)) {
        this.buildPasteStrokes(event as PasteEvent, index);
      } else if (isKeyEvent(event)) {
        this.buildKeyStroke(event as KeyEvent, index);
      } else {
        // build the step when typing is interrupted
        this.buildPendingStrokesStep();
      }
    });

    // build steps at the end
    this.buildPendingStrokesStep();

    return this.steps;
  }
}

export const buildTypeSteps = (events: Event[]) => {
  const factory = new TypeStepFactory(events);
  return factory.buildSteps();
};
