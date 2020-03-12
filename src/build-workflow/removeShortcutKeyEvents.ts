import Debug from 'debug';
import { find, findLast, remove } from 'lodash';
import { ElementEvent, KeyEvent } from '../types';

const debug = Debug('qawolf:removeShortcutKeyEvents');

const isControlEvent = (event: KeyEvent): boolean => {
  return event.value.startsWith('Meta') || event.value.startsWith('Control');
};

export const findShortcutKeyEvents = (
  key: string,
  events: ElementEvent[],
  triggerIndex: number,
): ElementEvent[] => {
  const downCmd = findLast(
    events,
    (event, eventIndex) =>
      eventIndex < triggerIndex &&
      event.name === 'keydown' &&
      isControlEvent(event as KeyEvent),
  );

  const downCharacter = findLast(
    events,
    (event, eventIndex) =>
      eventIndex < triggerIndex &&
      event.name === 'keydown' &&
      (event as KeyEvent).value == key,
  );

  const upCmd = find(
    events,
    (event, eventIndex) =>
      eventIndex > triggerIndex &&
      event.name === 'keyup' &&
      isControlEvent(event as KeyEvent),
  );

  const upCharacter = find(
    events,
    (event, eventIndex) =>
      eventIndex > triggerIndex &&
      event.name === 'keyup' &&
      (event as KeyEvent).value == key,
  );

  if (!downCmd || !downCharacter) {
    debug(`Could not find matching shortcut ${key}`);
    return [];
  }

  return [downCmd, downCharacter, upCharacter, upCmd].filter(e => e);
};

export const removeShortcutKeyEvents = (
  eventName: string,
  events: ElementEvent[],
): ElementEvent[] => {
  const filteredEvents = events.slice(0);

  let key: string;
  if (eventName === 'paste') {
    key = 'v';
  } else if (eventName === 'selectall') {
    key = 'a';
  } else {
    throw new Error(`Shortcut ${eventName} not supported`);
  }

  // find the matching shortcut key events per shortcut event and remove them
  filteredEvents.forEach((event, triggerIndex) => {
    if (event.name !== eventName) return;

    const pasteKeyEvents = findShortcutKeyEvents(
      key,
      filteredEvents,
      triggerIndex,
    );
    remove(filteredEvents, e => pasteKeyEvents.includes(e));
  });

  return filteredEvents;
};
