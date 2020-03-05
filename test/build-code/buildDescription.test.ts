import {
  buildDescription,
  describeDoc,
} from '../../src/build-code/buildDescription';
import { Step } from '../../src/types';
import { Doc } from '@jperl/html-parse-stringify';

const baseStep: Step = {
  action: 'click',
  htmlSelector: '',
  target: {
    name: 'input',
    type: 'tag',
  },
  index: 0,
  page: 0,
};

const doc = (attrs: object): Doc => ({
  attrs,
  name: 'input',
  type: 'tag',
  voidElement: false,
});

describe('buildDescription', () => {
  it('excludes target name if it does not exist', () => {
    expect(buildDescription(baseStep)).toBe('click input');
  });

  it('uses alt attribute if no other attributes specified', () => {
    const step: Step = {
      ...baseStep,
      target: {
        attrs: {
          alt: 'spirit',
        },
        name: 'img',
        type: 'tag',
      },
    };

    expect(buildDescription(step)).toBe('click "spirit" img');
  });

  it('formats clear input', () => {
    const step: Step = {
      ...baseStep,
      action: 'type',
      replace: true,
      value: null,
    };

    expect(buildDescription(step)).toEqual('clear input');
  });

  it('formats type input', () => {
    const step: Step = {
      ...baseStep,
      action: 'type',
      value: 'something',
    };

    expect(buildDescription(step)).toEqual('type into input');
  });

  it('formats scroll action', () => {
    const step: Step = {
      ...baseStep,
      action: 'scroll',
    };

    expect(buildDescription(step)).toBe('scroll');
  });

  it('formats select action', () => {
    const step: Step = {
      ...baseStep,
      action: 'select',
    };

    expect(buildDescription(step)).toBe('select');
  });

  it('formats Enter', () => {
    const step: Step = {
      ...baseStep,
      action: 'type',
      value: '↓Enter',
    };

    expect(buildDescription(step)).toEqual('Enter');
  });

  it('formats Tab', () => {
    const step: Step = {
      ...baseStep,
      action: 'type',
      value: '↓Tab',
    };

    expect(buildDescription(step)).toEqual('Tab');
  });
});

describe('describeDoc', () => {
  it('formats labels', () => {
    expect(describeDoc(doc({ labels: 'name username' }))).toBe(
      ' "name username"',
    );
  });

  it('shortens target name if needed', () => {
    expect(describeDoc(doc({ innertext: `sign in${'x'.repeat(200)}` }))).toBe(
      ' "sign inxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."',
    );
  });

  it('escapes single quotes', () => {
    expect(describeDoc(doc({ labels: "someone's" }))).toBe(` "someones"`);

    expect(describeDoc(doc({ labels: "'" }))).toBe('');
  });

  it('removes invisible characters', () => {
    expect(describeDoc(doc({ labels: '​' }))).toBe('');
  });
});
