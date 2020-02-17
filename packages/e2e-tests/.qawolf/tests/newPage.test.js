const { launch } = require("qawolf");
const selectors = require("../selectors/newPage");

describe('newPage', () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: "http://localhost:3000/" });
  });

  afterAll(() => browser.close());
  
  it('can click "Learn React" link', async () => {
    await browser.click(selectors[0]);
  });
  
  it('can click "Docs" link', async () => {
    await browser.click(selectors[1], { page: 1 });
  });
});