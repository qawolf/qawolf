import { buildSelectorForCues } from '../../src/web/cues';

describe('buildSelectorForCues', () => {
  it('builds selector from cues', () => {
    const cues = [
      { level: 0, type: 'class' as 'class', value: '.search-input' },

      {
        level: 1,
        type: 'attribute' as 'attribute',
        value: '[data-qa="search"]',
      },
      { level: 0, type: 'tag' as 'tag', value: 'input' },
      { level: 0, type: 'id' as 'id', value: '#search' },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input#search' },
    ]);
  });
});
