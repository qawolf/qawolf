import Debug from 'debug';
import {
  ElementEvent,
  InputEvent,
  Step,
} from '../types';
import { isChangeEvent, isInputEvent } from './event';
import { isContentEditableTarget, isInputTarget, isTextareaTarget } from './target';

const debug = Debug('qawolf:buildFillSteps');

const shouldFill = (event: ElementEvent): boolean => {
  const { target } = event;
  return (isInputEvent(event) || isChangeEvent(event)) &&
    (isInputTarget(target) || isTextareaTarget(target) || isContentEditableTarget(target)) &&
    // Some inputs emit "change" with a value but really can't or shouldn't be
    // "filled in" with that value. Checkbox and radio should work without filling
    // because there will be click events. File isn't supported.
    ![
      'checkbox',
      'radio',
      'file'
    ].includes(target.attrs && target.attrs.type);
}

/**
 * @summary Given a list of captured browser page events, returns a list of input fill
 *   steps that should be included when playing back the flow for testing purposes.
 */
export const buildFillSteps = (events: ElementEvent[]): Step[] => {
  debug('building fill steps');

  const fillSteps = [];
  let lastInputEvent: ElementEvent;
  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    if (isInputEvent(event)) {
      lastInputEvent = event;
    }
    if (lastInputEvent && shouldFill(event)) {
      // We use change events to determine when an input fill needs to happen
      // but they always happen AFTER the Tab, Enter, click, etc. that caused
      // the change to be committed. So instead of attaching the change event
      // to the fill, we attach the most recent input event, which happened
      // before the keydown or click.
      const { value } = event as InputEvent;
      // Also most inputs that have masks tend to fire "change" event multiple
      // times while you are typing in the mask. We only want the final fill value,
      // so if this fill is identical to the previous fill other than the value,
      // we'll overwrite the previous.
      const previousFill = fillSteps[fillSteps.length - 1];
      if (previousFill && previousFill.event.selector === lastInputEvent.selector) {
        previousFill.event = lastInputEvent;
        previousFill.value = value;
      } else {
        fillSteps.push({
          action: 'fill',
          event: lastInputEvent,
          index: fillSteps.length,
          value,
        });
      }
    }
  }

  return fillSteps;
};
