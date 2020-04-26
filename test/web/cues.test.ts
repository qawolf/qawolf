import { launch } from '../../src/utils';
import { webScript } from '../../src/web/addScript';
import { buildSelectorForCues, toSelectorString } from '../../src/web/cues';

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

// describe('isMatch', () => {
//   it('returns false if multiple matches', async () => {
//     const browser = await launch();
//     const page = await browser.newPage();
//     await page.addInitScript(webScript);
//     await page.goto('https://google.com');

//     const isMatch = await page.evaluate(() => {
//       // fix this test
//       return false;
//     });
//     expect(isMatch).toBe(false);

//     await browser.close();
//   });
// });

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
      { name: 'text', body: 'Click Me!' },
    ]);

    expect(selectorString).toBe('text="Click Me!"');
  });

  it('returns a mixed selector', () => {
    const selectorString = toSelectorString([
      { name: 'css', body: '.container' },
      { name: 'text', body: 'Submit' },
    ]);

    expect(selectorString).toBe('css=.container >> text="Submit"');
  });
});
