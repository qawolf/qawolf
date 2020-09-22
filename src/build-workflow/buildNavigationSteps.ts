import { Action, WindowEvent, Step } from '../types';

export const buildNavigationSteps = (events: WindowEvent[]): Step[] => {
  return events.map((event, index) => ({
    action: (event.name as Action),
    event,
    index,
    value: event.value,
  }));
};
