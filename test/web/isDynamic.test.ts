import { isDynamic } from '../../src/web/isDynamic';

const trueExamples = [
  '__BVID__71',
  'StyledBox-sc-13pk1d4-0',
  'gLFyf',
  'gb_C',
  'TSPr2b',
  'intercom-123v9c3',
  'u_0_b',
  'ggWlfB2BMlWvNeAo2F0uqw',
];

const falseExamples = [
  'toggle',
  'destroy',
  'btn',
  'mat',
  'form-control',
  'b-content__page-input',
  'glide__bullet',
  'app',
  'nav-link',
  'login-button',
  'col-sm-12',
  'footer',
  'intercom-container-body',
  'new-todo',
  'inputtext',
  'email',
  'learn-bar',
  'searchInput',
  'js-lang-list-button',
  'central-textlogo__image',
  'footer-sidebar-icon',
  'svg',
  'icon',
  'fa-search',
  'slider',
  'btn-playr-primary',
  'MyCart__itemCount__label',
  'SearchBox__cover',
  'tnt__zipInput',
  'MyAccount__label',
  'nav-sprite',
  'desktop-grid-3',
  'nytslm-li-link',
];

describe('isDynamic', () => {
  it('returns true for dynamic values', () => {
    trueExamples.forEach((example) => {
      expect(isDynamic(example)).toBe(true);
    });
  });

  it('returns false for non-dynamic values', () => {
    falseExamples.forEach((example) => {
      expect(isDynamic(example)).toBe(false);
    });
  });
});
