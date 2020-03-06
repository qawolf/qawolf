import { Expression } from '../../src/build-code/Expression';
import { htmlToDoc } from '../../src/web/serialize';
import { Step } from '../../src/types';

const doc = htmlToDoc;

const html = "<input id='my-input' data-qa='test-input' />";

export const baseStep: Step = {
  action: 'click',
  htmlSelector: `html=${html}`,
  index: 0,
  page: 0,
  target: doc(html),
};

export const expression = new Expression(baseStep);
