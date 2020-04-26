import { webScript } from '../../src/web/addScript';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';

export const amazon = {
  cart: 'text=Cart',
  hamburgerMenu: '#nav-hamburger-menu',
  searchInput: '.nav-search-field input',
};

export const todomvc = {
  activeLink: 'text=Active',
  completedLink: 'text=Completed',
  todoInput: '.new-todo',
  toggleItemOne: 'li:nth-of-type(1) .toggle',
  toggleItemTwo: 'li:nth-of-type(2) .toggle',
};

test('tmp: check fixtures', async () => {
  const browser = await launch();
  const page = await browser.newPage();

  await page.addInitScript(webScript);

  await page.goto(`${TEST_URL}/fixtures/amazon.html`);

  const cartElement = await page.$(amazon.cart);

  const xpath = await page.evaluate((e) => {
    const qawolf = (window as any).qawolf;
    return qawolf.getXpath(e);
  }, cartElement);

  expect(xpath).toEqual(`"//*[@id='nav-cart']/span[2]"`);

  await browser.close();
});
