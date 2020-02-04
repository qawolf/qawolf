import { serializeKeyEvents } from "@qawolf/browser";
import { logger } from "@qawolf/logger";
import { ElementEvent, Step, KeyEvent, PasteEvent } from "@qawolf/types";
import { isKeyEvent, isPasteEvent } from "@qawolf/web";
import { removePasteKeyEvents } from "./removePasteKeyEvents";

const SEPARATE_KEYS = ["Enter", "Tab"];

type BuildTypeStepOptions = {
  allEvents: ElementEvent[];
  firstEvent: ElementEvent;
  isFinal: boolean;
  value: string;
};

type StepOption = {
  isFinal: boolean;
};

const buildTypeStep = ({
  allEvents,
  firstEvent,
  isFinal,
  value
}: BuildTypeStepOptions): Step => {
  return {
    action: "type",
    html: firstEvent.target,
    // include event index so we can sort in buildSteps
    index: allEvents.indexOf(firstEvent),
    isFinal,
    page: firstEvent.page,
    value
  };
};

export class TypeStepFactory {
  private events: ElementEvent[];

  private steps: Step[] = [];

  private pendingEvents: KeyEvent[] = [];

  constructor(events: ElementEvent[]) {
    this.events = events;
  }

  buildPasteStep(event: PasteEvent) {
    const value = event.value;
    if (value.length <= 0) return;

    logger.debug("TypeStepFactory: buildPasteStep");

    const step = buildTypeStep({
      allEvents: this.events,
      firstEvent: event,
      isFinal: true,
      value
    });
    this.steps.push(step);
  }

  buildPendingStep({ isFinal }: StepOption) {
    /**
     * Build a type step for pending events.
     */
    if (!this.pendingEvents.length) return;

    logger.debug(
      `TypeStepFactory: buildPendingStep ${this.pendingEvents.length}`
    );

    const step = buildTypeStep({
      allEvents: this.events,
      firstEvent: this.pendingEvents[0],
      isFinal,
      value: serializeKeyEvents(this.pendingEvents)
    });
    this.steps.push(step);
    this.pendingEvents = [];
  }

  buildSeparateStep(event: KeyEvent) {
    // ignore keyup event, we build the separate step for the keydown
    // and include the up stroke as part of it
    if (event.name === "keyup") return;

    logger.debug("TypeStepFactory: buildSeparateStep");

    this.buildPendingStep({ isFinal: true });
    this.pendingEvents.push(event);
    this.pendingEvents.push({ ...event, name: "keyup" });
    this.buildPendingStep({ isFinal: true });
  }

  buildSteps() {
    const filteredEvents = removePasteKeyEvents(this.events);

    filteredEvents.forEach(event => {
      if (!event.isTrusted) return;

      if (
        this.pendingEvents.length &&
        event.page !== this.pendingEvents[0].page
      ) {
        // build the step when the page changes
        logger.debug("TypeStepFactory: buildPendingStep for page change");
        this.buildPendingStep({ isFinal: true });
      }

      if (isPasteEvent(event)) {
        this.buildPasteStep(event as PasteEvent);
      } else if (isKeyEvent(event)) {
        this.handleKeyEvent(event as KeyEvent);
      } else {
        logger.debug(
          `TypeStepFactory: buildPendingStep for event change ${event.name}`
        );

        // build the step when typing is interrupted
        this.buildPendingStep({ isFinal: true });
      }
    });

    logger.debug(`TypeStepFactory: buildPendingStep at end`);
    // build steps at the end
    this.buildPendingStep({ isFinal: false });

    return this.steps;
  }

  handleKeyEvent(event: KeyEvent) {
    if (SEPARATE_KEYS.some(separateKey => event.value.includes(separateKey))) {
      this.buildSeparateStep(event);
      return;
    }

    this.pendingEvents.push(event);
  }
}

export const buildTypeSteps = (events: ElementEvent[]) => {
  const factory = new TypeStepFactory(events);
  return factory.buildSteps();
};
