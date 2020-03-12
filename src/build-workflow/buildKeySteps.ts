import Debug from 'debug';
import { isKeyEvent, isPasteEvent, isSelectAllEvent } from './event';
import { removeShortcutKeyEvents } from './removeShortcutKeyEvents';
import {
  Action,
  Doc,
  ElementEvent,
  KeyEvent,
  PasteEvent,
  Step,
} from '../types';

type BuildStepOptions = {
  action?: Action;
  event: ElementEvent;
  value: string;
};

const debug = Debug('qawolf:buildKeySteps');

const MODIFIER_KEYS = ['Alt', 'Control', 'Meta', 'Shift'];

const isSpecialKey = (key: string): boolean => key.length > 1;

const isModifierKey = (key: string): boolean =>
  MODIFIER_KEYS.some(modifier => key.includes(modifier));

export class KeyStepFactory {
  private _events: ElementEvent[];
  private _pendingKeydownEvents: KeyEvent[] = [];
  private _selectAllTarget: Doc | null = null;
  private _steps: Step[] = [];

  constructor(events: ElementEvent[]) {
    this._events = events;
  }

  private _buildStep({ event, ...options }: BuildStepOptions): void {
    let action: Action = options.action || 'type';

    if (
      !options.action &&
      this._selectAllTarget &&
      JSON.stringify(this._selectAllTarget) === JSON.stringify(event.target)
    ) {
      this._selectAllTarget = null;
      action = 'fill';
    }

    const step: Step = {
      action,
      event,
      index: this._steps.length,
      value: options.value,
    };

    debug('build step %j', step);
    this._steps.push(step);
  }

  private _buildPendingKeydowns(): void {
    const events = this._pendingKeydownEvents;
    if (!events.length) return;

    const value = events.map(e => e.value).join('');
    debug(`build pending keydowns ${events.length}: ${value}`);
    this._buildStep({ event: events[0], value });
    this._pendingKeydownEvents = [];
  }

  private _didPageChange(event: ElementEvent): boolean {
    if (!this._pendingKeydownEvents.length) return false;
    return event.page !== this._pendingKeydownEvents[0].page;
  }

  private _handleKeyDown(event: KeyEvent): void {
    if (isModifierKey(event.value || '')) {
      // ignore modifier keys for now since the modified key is captured by event.key
      // XXX add keyboard.up/down support in https://github.com/qawolf/qawolf/issues/492
      debug(`skip modifier ${event.value}`);
      return;
    }

    if (isSpecialKey(event.value)) {
      this._buildPendingKeydowns();
      debug(`build press ${event.value}`);
      this._buildStep({ action: 'press', event, value: event.value });
    } else {
      this._pendingKeydownEvents.push(event);
    }
  }

  public buildSteps(): Step[] {
    const filteredEvents = removeShortcutKeyEvents(
      'selectall',
      removeShortcutKeyEvents('paste', this._events),
    );

    filteredEvents.forEach(event => {
      if (!event.isTrusted) return;

      if (this._didPageChange(event)) this._buildPendingKeydowns();

      if (event.name === 'keydown') {
        this._handleKeyDown(event as KeyEvent);
        return;
      }

      // when the event is no longer a key event, build pending keydowns
      if (!isKeyEvent(event)) this._buildPendingKeydowns();

      if (isPasteEvent(event)) {
        this._buildStep({ event, value: (event as PasteEvent).value });
      } else if (isSelectAllEvent(event)) {
        this._selectAllTarget = event.target;
      }
    });

    // build the pending keydowns after the last event
    this._buildPendingKeydowns();

    return this._steps;
  }
}

export const buildKeySteps = (events: ElementEvent[]): Step[] => {
  const factory = new KeyStepFactory(events);
  return factory.buildSteps();
};
