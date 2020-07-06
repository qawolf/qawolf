import Debug from 'debug';
import {
  Doc,
  ElementEvent,
  KeyEvent,
  Step,
} from '../types';
import { isInputTarget } from './target';

const debug = Debug('qawolf:buildPressSteps');

/**
 * A subset of the full list:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 *
 * These are key presses that we always want to include when playing back. There are many
 * more potential keys but a lot of them are unlikely to be used for any shortcut or
 * navigation purposes on any website.
 */
const KEYS_TO_TRACK_ALWAYS = new Set([
  'Enter',
  'Escape',
  'Tab'
]);

/**
 * A subset of the full list:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 *
 * These are key presses that we want to include when playing back as long as they
 * aren't being pressed as part of editing some input text.
 */
const KEYS_TO_TRACK_FOR_NON_INPUT = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Backspace',
  'Delete',
  'End',
  'Home',
  'PageDown',
  'PageUp'
]);

/**
 * @summary Determines whether a key press event should be included as part of the
 *   test code being built. Some keys are always included and some are included only
 *   when we're not editing text, i.e. the target isn't an input of some sort.
 * @param {String} key The name of the key that was pressed.
 * @param {Object} target Some details about the event target.
 * @return {Boolean} True if we should include this key as part of the playback script.
 */
const shouldTrackKeyPress = (key: string, target: Doc): boolean => {
  if (KEYS_TO_TRACK_ALWAYS.has(key)) return true;
  if (!isInputTarget(target) && KEYS_TO_TRACK_FOR_NON_INPUT.has(key)) return true;
  return false;
}

/**
 * @summary Given a list of captured browser page events, returns a list of key press
 *   steps that should be included when playing back the flow for testing purposes.
 */
export const buildPressSteps = (events: ElementEvent[]): Step[] => {
  debug('building press steps');

  return events.reduce((pressSteps: Step[], event: ElementEvent): Step[] => {
    if (event.name === 'keydown') {
      const { value } = event as KeyEvent;
      if (shouldTrackKeyPress(value, event.target)) {
        debug(`build press step for keydown ${value}`);
        pressSteps.push({
          action: 'press',
          event,
          index: pressSteps.length,
          value,
        });
      } else {
        debug(`not building press step for keydown ${value}`);
      }
    }

    return pressSteps;
  }, []);
};
