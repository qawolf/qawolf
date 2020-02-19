import { serializeKeyEvents } from "@qawolf/browser";
import { logger } from "@qawolf/logger";
import {
  DocSelector,
  ElementEvent,
  KeyEvent,
  PasteEvent,
  Step
} from "@qawolf/types";
import { isKeyEvent, isPasteEvent, isSelectAllEvent } from "@qawolf/web";
import { removeShortcutKeyEvents } from "./removeShortcutKeyEvents";

const SEPARATE_KEYS = ["Enter", "Tab"];

type BuildTypeStepOptions = {
  firstEvent: ElementEvent;
  value: string;
};

export class TypeStepFactory {
  private _events: ElementEvent[];
  private _pendingEvents: KeyEvent[] = [];
  private _selectAllTarget: DocSelector | null = null;
  private _steps: Step[] = [];

  constructor(events: ElementEvent[]) {
    this._events = events;
  }

  buildPasteStep(event: PasteEvent) {
    const value = event.value;
    if (value.length <= 0) return;

    logger.debug("TypeStepFactory: buildPasteStep");
    this.buildTypeStep({ firstEvent: event, value });
  }

  buildPendingStep(reason: string) {
    /**
     * Build a type step for pending events.
     */
    if (!this._pendingEvents.length) return;

    logger.debug(
      `TypeStepFactory: buildPendingStep ${this._pendingEvents.length} for ${reason}`
    );

    const firstEvent = this._pendingEvents[0];

    this.buildTypeStep({
      firstEvent,
      value: serializeKeyEvents(this._pendingEvents)
    });
    this._pendingEvents = [];
  }

  buildSeparateStep(event: KeyEvent) {
    // ignore keyup event, we build the separate step for the keydown
    // and include the up stroke as part of it
    if (event.name === "keyup") return;

    logger.debug("TypeStepFactory: buildSeparateStep");

    this.buildPendingStep("separate step");
    this._pendingEvents.push(event);
    this._pendingEvents.push({ ...event, name: "keyup" });
    this.buildPendingStep("separate step");
  }

  buildSteps() {
    const filteredEvents = removeShortcutKeyEvents(
      "selectall",
      removeShortcutKeyEvents("paste", this._events)
    );

    filteredEvents.forEach(event => {
      if (!event.isTrusted) return;

      if (
        this._pendingEvents.length &&
        event.page !== this._pendingEvents[0].page
      ) {
        // build the step when the page changes
        this.buildPendingStep("page change");
      }

      if (isSelectAllEvent(event)) {
        this._selectAllTarget = event.target;
      } else if (isPasteEvent(event)) {
        this.buildPasteStep(event as PasteEvent);
      } else if (isKeyEvent(event)) {
        this.handleKeyEvent(event as KeyEvent);
      } else {
        // build the step when typing is interrupted
        this.buildPendingStep("event change");
      }
    });

    // build steps at the end
    this.buildPendingStep("last event");

    return this._steps;
  }

  buildTypeStep({ firstEvent, value }: BuildTypeStepOptions): Step {
    const index = this._events.indexOf(firstEvent);

    const step: Step = {
      action: "type",
      html: firstEvent.target,
      // include event index so we can sort in buildSteps
      index,
      page: firstEvent.page,
      value
    };

    // set replace to true when the select all target
    // matches the pending type step
    if (
      this._selectAllTarget &&
      JSON.stringify(firstEvent.target) ===
        JSON.stringify(this._selectAllTarget)
    ) {
      step.replace = true;
      this._selectAllTarget = null;
    }

    this._steps.push(step);

    return step;
  }

  handleKeyEvent(event: KeyEvent) {
    if (SEPARATE_KEYS.some(separateKey => event.value.includes(separateKey))) {
      this.buildSeparateStep(event);
      return;
    }

    this._pendingEvents.push(event);
  }
}

export const buildTypeSteps = (events: ElementEvent[]) => {
  const factory = new TypeStepFactory(events);
  return factory.buildSteps();
};
