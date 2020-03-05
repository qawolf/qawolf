export const buildScriptTemplate = (name: string): string => {
  const code = `const qawolf = require("qawolf");

const ${name} = async context => {
  let page = await context.newPage();
  await page.goto("URL");
  await qawolf.create();
};

exports.${name} = ${name};

if (require.main === module) {
  (async () => {
    const browser = await qawolf.launch();
    const context = await browser.newContext();
    await qawolf.register(context);

    await ${name}(context);
    await browser.close();
  })();
}`;

  return code;
};

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
