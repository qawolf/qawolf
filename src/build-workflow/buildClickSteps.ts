import Debug from 'debug';
import { ElementEvent, Step } from '../types';

const debug = Debug('create-playwright:buildClickSteps');

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
      ['keydown', 'keyup'].includes(previousEvent.name) &&
      event.time - previousEvent.time < 50
    ) {
      // skip system-initiated clicks triggered by a key press
      // ex. "Enter" triggers a click on a submit input
      debug(`skip click shortly after previous event ${event.time}`);
      return false;
    }

    // ignore clicks on selects
    let name = event.target.name;
    if (name) name = name.toLowerCase();
    return name !== 'select';
  });
};

const groupClickEvents = (
  events: ElementEvent[],
  timeWindow = 200,
): ElementEvent[][] => {
  const groupedEvents = [];
  let group: ElementEvent[] = [];

  events.forEach(event => {
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

  groupedClickEvents.forEach(events => {
    let event = events[0] as ElementEvent;

    const inputEvent = events.find(event => {
      const name = event.target.name || '';
      return name.toLowerCase() === 'input';
    });
    if (inputEvent) {
      // if an event in the group is on an  input, assume the click propagated
      // to an element like a checkbox or radio, which is most accurate target
      event = inputEvent;
    }

    steps.push({
      action: 'click',
      cssSelector: event.cssSelector,
      htmlSelector: event.htmlSelector,
      // include event index so we can sort in buildSteps
      index: (event as any).index,
      page: event.page,
      target: event.target,
    });
  });

  return steps;
};
