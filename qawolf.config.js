const createTemplate = ({ name }) => {
  return `import { Browser, BrowserContext } from 'playwright';
import qawolf from 'qawolf';
import { connect } from '../browser';
import { TEST_URL } from '../utils';

let browser: Browser;
let context: BrowserContext;

beforeAll(async () => {
  browser = await connect();
  context = await browser.newContext();
  await qawolf.register(context);
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test("${name}", async () => {
  const targetPage = await context.newPage();
  const targetId = (targetPage as any)._delegate._targetId;
  console.log(\`targetId="\${targetId}"\`);
  await targetPage.goto(\`\${TEST_URL}infinite-scroll\`);
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
