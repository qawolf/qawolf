// TODO move into selector.test
// import { Browser, Page } from 'playwright';
// import { launch } from '../../src/utils';
// import { QAWolfWeb } from '../../src/web';
// import { webScript } from '../../src/web/addScript';
// import { amazon, todomvc } from '../fixtures/selectors';
// import { TEST_URL } from '../utils';

// describe('buildSelector', () => {
//   let browser: Browser;
//   let page: Page;

//   beforeAll(async () => {
//     browser = await launch({ headless: false, devtools: true });
//     page = await browser.newPage();
//     await page.addInitScript(webScript);
//   });

//   afterAll(() => browser.close());

//   const buildSelector = async (selector: string): Promise<string> => {
//     const element = await page.$(selector);

//     return page.evaluate((e) => {
//       const qawolf: QAWolfWeb = (window as any).qawolf;
//       return qawolf.buildSelector(e as HTMLElement);
//     }, element);
//   };

//   test('amazon', async () => {
//     await page.goto(`${TEST_URL}/fixtures/amazon.html`);
//     expect(await buildSelector(amazon.cart)).toEqual(amazon.cart);
//   });

//   test.only('todomvc', async () => {
//     await page.goto(`${TEST_URL}/fixtures/todomvc.html`);
//     expect(await buildSelector(todomvc.toggleItemOne)).toEqual(
//       todomvc.toggleItemOne,
//     );

//     expect(await buildSelector(todomvc.toggleItemTwo)).toEqual(
//       todomvc.toggleItemTwo,
//     );
//   });
// });
