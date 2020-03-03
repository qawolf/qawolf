const { launch } = require("qawolf");
const selectors = require("../selectors/select");

describe('select', () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: "localhost:3000" });
  });

  afterAll(() => browser.close());
  
  it('can click "Selects" link', async () => {
    await browser.click(selectors[0]);
  });
  
  it('can select "Best pet? Cat Dog Hedgehog"', async () => {
    await browser.select({ css: "[data-qa='html-select']" }, "dog");
  });
});