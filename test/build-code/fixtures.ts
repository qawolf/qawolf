import { ElementEvent, Step } from '../../src/types';

export const baseEvent: ElementEvent = {
  isTrusted: true,
  name: 'mousedown',
  page: 0,
  selector: `[data-qa="test-input"]`,
  target: {
    attrs: {
      'data-qa': 'test-input',
      id: 'my-input',
    },
    name: 'input',
  },
  time: 0,
};

export const baseStep: Step = {
  action: 'click',
  event: baseEvent,
  index: 0,
};
