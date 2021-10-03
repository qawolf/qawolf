import { launch } from "../../src";

test("launch works within a playwright test", async () => {
  const { browser, context } = await launch();
  const page = await context.newPage();
  await page.setContent(`
    <html>
      <body>
        <p>Hello World</p>
      </body>
    </html>
  `);
  const text = await page.innerText("p");
  expect(text).toBe("Hello World");
  await browser.close();
});
