import { Doc } from '@jperl/html-parse-stringify';
import {
  buildSelectorKey,
  buildSelector,
} from '../../src/build-code/buildSelectors';
import { baseStep } from './fixtures';

const doc = (attrs: object = {}): Doc => ({
  attrs,
  name: 'input',
  type: 'tag',
  voidElement: false,
});

describe('buildSelectorKey', () => {
  it('escapes single quotes', () => {
    expect(buildSelectorKey(0, doc({ labels: "someone's" }))).toBe(
      '0_someones_input',
    );

    expect(buildSelectorKey(0, doc({ labels: "'" }))).toBe('0_input');
  });

  it('excludes target name if it does not exist', () => {
    expect(buildSelectorKey(0, doc())).toBe('0_input');
  });

  it('formats labels', () => {
    expect(buildSelectorKey(0, doc({ labels: 'name username' }))).toBe(
      '0_name_username_input',
    );
  });

  it('shortens target name if needed', () => {
    expect(
      buildSelectorKey(0, doc({ innertext: `sign in${'x'.repeat(100)}` })),
    ).toBe('0_sign_inxxxxxxxx_input');
  });

  it('removes invisible characters', () => {
    expect(buildSelectorKey(0, doc({ labels: '​' }))).toBe('0_input');
  });

  it('uses alt attribute if no other attributes specified', () => {
    expect(
      buildSelectorKey(0, {
        attrs: {
          alt: 'spirit',
        },
        name: 'img',
        type: 'tag',
      }),
    ).toBe('0_spirit_img');
  });
});

describe('buildSelector', () => {
  it('inlines css selector', () => {
    expect(
      buildSelector({
        ...baseStep,
        event: {
          ...baseStep.event,
          cssSelector: '[data-test=1]',
        },
      }),
    ).toEqual('"[data-test=1]"');
  });

  it('references html selector', () => {
    expect(buildSelector(baseStep)).toEqual('selectors["0_my_input_input"]');
  });
});
