const createTemplate = ({ name }) => {
  return `import { Browser, Page } from 'playwright';
import qawolf from 'qawolf';
import { connect } from '../browser';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await connect();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
  const targetId = (page as any)._delegate._targetId;
  console.log(\`targetId="\${targetId}"\`);
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('${name}', async () => {
  await page.goto(\`\${TEST_URL}infinite-scroll\`);
  await qawolf.create();
});`;
};

module.exports = {
  config: 'node_modules/qawolf/ts-jest.config.json',
  createTemplate:
    process.env.QAW_CREATE_E2E_TEST === '1' ? createTemplate : undefined,
  rootDir: 'test/.qawolf',
  useTypeScript: true,
};
