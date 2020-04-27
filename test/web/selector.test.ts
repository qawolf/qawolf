import { toSelectorString } from '../../src/web/selector';

describe('toSelectorString', () => {
  it('returns a pure CSS selector if possible', () => {
    const selectorString = toSelectorString([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input' },
    ]);

    expect(selectorString).toBe('[data-qa="search"] input.search-input');
  });

  it('returns a single text selector', () => {
    const selectorString = toSelectorString([
      { name: 'text', body: '"Click Me!"' },
    ]);

    expect(selectorString).toBe('text="Click Me!"');
  });

  it('returns a mixed selector', () => {
    const selectorString = toSelectorString([
      { name: 'css', body: '.container' },
      { name: 'text', body: '"Submit"' },
    ]);

    expect(selectorString).toBe('css=.container >> text="Submit"');
  });
});
