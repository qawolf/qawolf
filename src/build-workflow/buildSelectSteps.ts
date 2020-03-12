import { ElementEvent, InputEvent, Step } from '../types';

export const buildSelectSteps = (events: ElementEvent[]): Step[] => {
  const steps: Step[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i] as InputEvent;

    // ignore system initiated actions & other non-input actions
    if (!event.isTrusted || event.name !== 'input') continue;

    // ignore input events not on selects
    if (event.target.name !== 'select') continue;

    steps.push({
      action: 'select',
      event,
      index: steps.length,
      value: event.value,
    });
  }

  return steps;
};
