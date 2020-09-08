const createTemplate = ({ name }) => {
  return `import qawolf from 'qawolf';
import { connect } from '../browser';
import { TEST_URL } from '../utils';

test("${name}", async () => {
  const browser = await connect();
  const context = await browser.newContext();
  await qawolf.register(context);
  const page = await context.newPage();
  const targetId = (page as any)._delegate._targetId;
  console.log(\`targetId="\${targetId}"\`);

  await page.goto(\`\${TEST_URL}infinite-scroll\`);
  await qawolf.create();

  await qawolf.stopVideos();
  await browser.close();
});`;
};

module.exports = {
  config: 'node_modules/qawolf/ts-jest.config.json',
  createTemplate:
    process.env.QAW_CREATE_E2E_TEST === '1' ? createTemplate : undefined,
  rootDir: 'test/.qawolf',
  useTypeScript: true,
};
