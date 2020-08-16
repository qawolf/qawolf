import { isDynamic } from '../../src/web/isDynamic';

describe('isDynamic', () => {
  it.each([
    '__BVID__71',
    '.item_iv2wgb-o_O-hover_yhuzbt',
    'gb_C',
    'ggWlfB2BMlWvNeAo2F0uqw',
    'gLFyf',
    'intercom-123v9c3',
    'StyledBox-sc-13pk1d4-0',
    'StyledLayer-rmtehz-0',
    'TSPr2b',
    'u_0_b',
  ])('is dynamic: %s', (example) => {
    expect(isDynamic(example)).toBe(true);
  });

  it.each([
    'app',
    'b-content__page-input',
    'btn',
    'btn-playr-primary',
    'central-textlogo__image',
    'col-sm-12',
    'contestSearchInput-839',
    'desktop-grid-3',
    'destroy',
    'email',
    'fa-search',
    'footer',
    'footer-sidebar-icon',
    'form-control',
    'glide__bullet',
    'icon',
    'inputtext',
    'intercom-container-body',
    'js-lang-list-button',
    'learn-bar',
    'login-button',
    'mat',
    'my:account',
    'MyAccount__label',
    'MyCart__itemCount__label',
    'nav-link',
    'nav-sprite',
    'new-todo',
    'nytslm-li-link',
    'SearchBox__cover',
    'searchInput',
    'slider',
    'special:id',
    'svg',
    'toggle',
    'tnt__zipInput',
  ])('is not dynamic: %s', (example) => {
    expect(isDynamic(example)).toBe(false);
  });
});
