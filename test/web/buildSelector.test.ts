// import { Browser, Page } from 'playwright';
// import { webScript } from '../../src/web/addScript';
// import { launch } from '../../src/utils';
// import { amazon, todomvc } from '../fixtures/selectors';
// import { TEST_URL } from '../utils';

// describe('buildSelector', () => {
//   let browser: Browser;
//   let page: Page;

//   beforeAll(async () => {
//     browser = await launch();
//     page = await browser.newPage();
//     await page.addInitScript(webScript);
//   });

//   afterAll(() => browser.close());

//   const buildSelector = async (selector: string): Promise<string> => {
//     const element = await page.$(selector);

//     return page.evaluate((e) => {
//       const qawolf = (window as any).qawolf;
//       return qawolf.buildSelector(e);
//     }, element);
//   };

//   test('amazon', async () => {
//     await page.goto(`${TEST_URL}/fixtures/amazon.html`);
//     expect(await buildSelector(amazon.cart)).toEqual(amazon.cart);
//   });

//   test('todomvc', async () => {
//     await page.goto(`${TEST_URL}/fixtures/todomvc.html`);
//     expect(await buildSelector(todomvc.todoInput)).toEqual(todomvc.todoInput);
//   });
// });
