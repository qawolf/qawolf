import { htmlToDoc } from '../../src/web/serialize';
import { ElementEvent, Step } from '../../src/types';

const doc = htmlToDoc;

const html = "<input id='my-input' data-qa='test-input' />";

export const baseEvent: ElementEvent = {
  htmlSelector: `html=${html}`,
  isTrusted: true,
  name: 'mousedown',
  page: 0,
  target: doc(html),
  time: 0,
};

export const baseStep: Step = {
  action: 'click',
  event: baseEvent,
  index: 0,
};
