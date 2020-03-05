import { loadFixtures } from '../loadFixtures';
import { ElementEvent, KeyEvent } from '../../src/types';
import {
  findShortcutKeyEvents,
  removeShortcutKeyEvents,
} from '../../src/build-workflow/removeShortcutKeyEvents';

let events: ElementEvent[];

beforeAll(async () => {
  events = (await loadFixtures('login')).events;
});

describe('findShortcutKeyEvents', () => {
  it('finds matching paste events', () => {
    const pasteIndex = events.findIndex(e => e.name === 'paste');
    const pasteEvents = findShortcutKeyEvents('v', events, pasteIndex);
    expect(pasteEvents.map(e => e.time)).toEqual([
      1583106438550,
      1583106438645,
      1583106438795,
      1583106438794,
    ]);
  });
});

describe('removeShortcutKeyEvents', () => {
  it('removes CMD+V key events', () => {
    const replacedEvents = removeShortcutKeyEvents('paste', events);
    expect(
      replacedEvents
        .filter(e => e.name === 'keydown' || e.name === 'keyup')
        .map(
          e => `${e.name === 'keydown' ? '↓' : '↑'}${(e as KeyEvent).value}`,
        ),
    ).toMatchSnapshot();
  });
});
