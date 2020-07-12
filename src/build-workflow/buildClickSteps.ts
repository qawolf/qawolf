import Debug from 'debug';
import { ElementEvent, Step } from '../types';
import { isInputTarget } from './target';

const debug = Debug('qawolf:buildClickSteps');

const filterClickEvents = (events: ElementEvent[]): ElementEvent[] => {
  return events.filter((event, i) => {
    // track original event index
    (event as any).index = i;

    // ignore system initiated clicks
    if (!event.isTrusted) return false;

    // ignore other actions
    if (!['click', 'mousedown'].includes(event.name)) return false;

    const previousEvent = events[i - 1];
    if (
      previousEvent &&
      ['change', 'keydown', 'keyup'].includes(previousEvent.name) &&
      event.time - previousEvent.time < 50
    ) {
      // skip system-initiated clicks triggered by a key press
      // ex. "Enter" triggers a click on a submit input
      debug(`skip click shortly after previous event ${event.time}`);
      return false;
    }

    // ignore clicks on selects
    return event.target.name !== 'select';
  });
};

const groupClickEvents = (
  events: ElementEvent[],
  timeWindow = 200,
): ElementEvent[][] => {
  const groupedEvents = [];
  let group: ElementEvent[] = [];

  events.forEach((event) => {
    if (!group.length) {
      // first group
      group.push(event);
      return;
    }

    const lastEvent = group[group.length - 1] as ElementEvent;
    if (event.time - lastEvent.time < timeWindow) {
      // event is within time window
      group.push(event);
      return;
    }

    // start a new group
    groupedEvents.push(group);
    group = [event];
  });

  if (group.length) {
    // append last group
    groupedEvents.push(group);
  }

  return groupedEvents;
};

export const buildClickSteps = (events: ElementEvent[]): Step[] => {
  const clickEvents = filterClickEvents(events);
  const groupedClickEvents = groupClickEvents(clickEvents);
  const steps: Step[] = [];

  groupedClickEvents.forEach((events) => {
    let event = events[0] as ElementEvent;

    const inputEvent = events.find((event) => isInputTarget(event.target));
    if (inputEvent) {
      // if an event in the group is on an  input, assume the click propagated
      // to an element like a checkbox or radio, which is most accurate target
      event = inputEvent;
    }

    steps.push({
      action: 'click',
      index: steps.length,
      event: event,
    });
  });

  return steps;
};
