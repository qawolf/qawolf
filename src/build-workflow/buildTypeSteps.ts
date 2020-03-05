import Debug from 'debug';
import { isKeyEvent, isPasteEvent, isSelectAllEvent } from '../event';
import { removeShortcutKeyEvents } from './removeShortcutKeyEvents';
import { serializeKeyEvents } from './serializeKeyEvents';
import { Doc, ElementEvent, KeyEvent, PasteEvent, Step } from '../types';

const debug = Debug('create-playwright:buildTypeSteps');

const SEPARATE_KEYS = ['Enter', 'Tab'];

type BuildStepOptions = {
  firstEvent: ElementEvent;
  value: string;
};

export class TypeStepFactory {
  private _events: ElementEvent[];
  private _pendingEvents: KeyEvent[] = [];
  private _selectAllTarget: Doc | null = null;
  private _steps: Step[] = [];

  constructor(events: ElementEvent[]) {
    this._events = events;
  }

  buildPasteStep(event: PasteEvent): void {
    const value = event.value;
    if (value.length <= 0) return;

    debug('buildPasteStep');
    this.buildStep({ firstEvent: event, value });
  }

  buildPendingStep(reason: string): void {
    /**
     * Build a type step for pending events.
     */
    if (!this._pendingEvents.length) return;

    debug(`buildPendingStep ${this._pendingEvents.length} for ${reason}`);

    const firstEvent = this._pendingEvents[0];

    this.buildStep({
      firstEvent,
      value: serializeKeyEvents(this._pendingEvents),
    });
    this._pendingEvents = [];
  }

  buildSeparateStep(event: KeyEvent): void {
    // ignore keyup event, we build the separate step for the keydown
    // and include the up stroke as part of it
    if (event.name === 'keyup') return;

    debug('buildSeparateStep');

    this.buildPendingStep('separate step');
    this._pendingEvents.push(event);
    this._pendingEvents.push({ ...event, name: 'keyup' });
    this.buildPendingStep('separate step');
  }

  buildStep({ firstEvent, value }: BuildStepOptions): Step {
    const index = this._events.indexOf(firstEvent);

    const step: Step = {
      action: 'type',
      cssSelector: firstEvent.cssSelector,
      htmlSelector: firstEvent.htmlSelector,
      // include event index so we can sort in buildSteps
      index,
      page: firstEvent.page,
      target: firstEvent.target,
      value,
    };

    // replace when the select all target
    // matches this type step
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

  buildSteps(): Step[] {
    const filteredEvents = removeShortcutKeyEvents(
      'selectall',
      removeShortcutKeyEvents('paste', this._events),
    );

    filteredEvents.forEach(event => {
      if (!event.isTrusted) return;

      if (
        this._pendingEvents.length &&
        event.page !== this._pendingEvents[0].page
      ) {
        // build the step when the page changes
        this.buildPendingStep('page change');
      }

      if (isSelectAllEvent(event)) {
        this._selectAllTarget = event.target;
      } else if (isPasteEvent(event)) {
        this.buildPasteStep(event as PasteEvent);
      } else if (isKeyEvent(event)) {
        this.handleKeyEvent(event as KeyEvent);
      } else {
        // build the step when typing is interrupted
        this.buildPendingStep('event change');
      }
    });

    // build steps at the end
    this.buildPendingStep('last event');

    return this._steps;
  }

  handleKeyEvent(event: KeyEvent): void {
    if (SEPARATE_KEYS.some(separateKey => event.value.includes(separateKey))) {
      this.buildSeparateStep(event);
      return;
    }

    this._pendingEvents.push(event);
  }
}

export const buildTypeSteps = (events: ElementEvent[]): Step[] => {
  const factory = new TypeStepFactory(events);
  return factory.buildSteps();
};
