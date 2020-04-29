import { htmlToDoc } from '../../src/web/serialize';
import { ElementEvent, Step } from '../../src/types';

const html = "<input id='my-input' data-qa='test-input' />";

export const baseEvent: ElementEvent = {
  isTrusted: true,
  name: 'mousedown',
  page: 0,
  selector: `[data-qa="test-input"]`,
  target: htmlToDoc(html),
  time: 0,
};

export const baseStep: Step = {
  action: 'click',
  event: baseEvent,
  index: 0,
};
