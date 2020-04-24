import { launch } from '../../src/utils';
import { webScript } from '../../src/web/addScript';

test('use selector engine', async () => {
  const browser = await launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  await page.addInitScript(webScript);
  await page.goto('https://google.com');

  await page.evaluate(() => {
    const evaluator = eval((window as any).qawolf.selectorSource);

    const elements = evaluator.querySelectorAll(
      [
        // { name: 'css', body: '.FPdoLc.tfB0Bf' },
        { name: 'text', body: 'Google Search' },
      ],
      document.body,
    );

    console.log(elements);
  });

  await browser.close();
});
