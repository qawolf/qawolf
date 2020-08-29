import { isInputTarget } from './target';
import { ElementEvent, Step } from '../types';

const CLICK_EVENTS = ['click', 'mousedown'];

const shouldIncludeClickEvent = (
  event: ElementEvent,
  previousEvent?: ElementEvent,
): boolean => {
  // ignore system initiated clicks
  if (!event.isTrusted) return false;

  // ignore non-click events
  if (!CLICK_EVENTS.includes(event.name)) return false;

  // ignore clicks on selects
  if (event.target.name === 'select') return false;

  // skip system-initiated clicks triggered by a key press
  // ex. "Enter" triggers a click on a submit input
  if (
    previousEvent &&
    ['change', 'keydown', 'keyup'].includes(previousEvent.name) &&
    event.time - previousEvent.time < 50
  ) {
    return false;
  }

  return true;
};

const groupClickEvents = (events: ElementEvent[]): ElementEvent[][] => {
  const clickGroups = [];

  let group: ElementEvent[] = [];

  events.forEach((event, i) => {
    const previousEvent = events[i - 1];

    if (!shouldIncludeClickEvent(event, previousEvent)) return;

    // always group clicks with the previous mousedown/click events
    // a click will follow a mousedown if the mouse was released within the same element
    // a click will follow a click if it propagated to a higher element (a click on a label propagates to the input)
    if (!group.length || event.name === 'click') {
      group.push(event);
      return;
    }

    // start a new group
    clickGroups.push(group);
    group = [event];
  });

  if (group.length) {
    // append last group
    clickGroups.push(group);
  }

  return clickGroups;
};

export const buildClickSteps = (events: ElementEvent[]): Step[] => {
  const groupedClickEvents = groupClickEvents(events);
  const steps: Step[] = [];

  groupedClickEvents.forEach((events) => {
    let firstClickEvent: ElementEvent;
    let firstEventWithInputTarget: ElementEvent;
    let firstDoubleClickEvent: ElementEvent;

    // Loop through all events in group to gather some details about the group
    for (const event of events) {
      if (!firstEventWithInputTarget && isInputTarget(event.target)) {
        firstEventWithInputTarget = event;
      }
      if (!firstClickEvent && event.name === 'click') {
        firstClickEvent = event;
      }
      if (!firstDoubleClickEvent && event.isDoubleClick) {
        firstDoubleClickEvent = event;
      }
    }

    // Use the first "click" event in the group.
    // Except if an event in the group is on an input, assume the click propagated
    // to an element like a checkbox or radio, which is most accurate target.
    const event = firstEventWithInputTarget || firstClickEvent || events[0];

    // If there's a click that is the second in a double-click series,
    // replace the already-pushed first click with a dblclick.
    if (firstDoubleClickEvent && steps.length) {
      steps[steps.length - 1] = {
        action: 'dblclick',
        event: firstDoubleClickEvent,
        index: steps.length - 1,
      };
      return;
    }

    steps.push({
      action: 'click',
      event,
      index: steps.length,
    });
  });

  return steps;
};
