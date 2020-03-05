export const buildTestTemplate = (name: string): string => {
  const code = `const qawolf = require("qawolf");
  let browser;
  let context;

  beforeAll(async () => {
    browser = await qawolf.launch();
    context = await browser.newContext();
    await qawolf.register(context);
  });

  afterAll(() => browser.close());

  test('${name}', async () => {
    let page = await context.newPage();
    await qawolf.create();
  });`;

  return code;
};
