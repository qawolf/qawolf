import { Doc } from '@jperl/html-parse-stringify';
import { buildDescription } from '../../src/build-code/buildDescription';

const doc = (attrs: object = {}): Doc => ({
  attrs,
  name: 'input',
  type: 'tag',
  voidElement: false,
});

describe('buildDescription', () => {
  it('escapes single quotes', () => {
    expect(buildDescription(doc({ labels: "someone's" }))).toBe(
      'someones_input',
    );

    expect(buildDescription(doc({ labels: "'" }))).toBe('input');
  });

  it('excludes target name if it does not exist', () => {
    expect(buildDescription(doc())).toBe('input');
  });

  it('formats labels', () => {
    expect(buildDescription(doc({ labels: 'name username' }))).toBe(
      'name_username_input',
    );
  });

  it('shortens target name if needed', () => {
    expect(
      buildDescription(doc({ innertext: `sign in${'x'.repeat(100)}` })),
    ).toBe('sign_inxxxxxxxx_input');
  });

  it('removes invisible characters', () => {
    expect(buildDescription(doc({ labels: '​' }))).toBe('input');
  });

  it('uses alt attribute if no other attributes specified', () => {
    expect(
      buildDescription({
        attrs: {
          alt: 'spirit',
        },
        name: 'img',
        type: 'tag',
      }),
    ).toBe('spirit_img');
  });
});
