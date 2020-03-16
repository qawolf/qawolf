import { camelCase } from 'lodash';
import { devices } from 'playwright';

interface BuildTemplateOptions {
  device?: string;
  name: string;
  statePath?: string;
  url: string;
}

const REQUIRE_QAWOLF = 'const qawolf = require("qawolf");';
const INVALID_NAME_ERROR = 'Missing initializer in const declaration';

export const buildValidVariableName = (name: string): string => {
  try {
    // try creating variable with specified name
    eval(`const ${name} = 0`);
    return name;
  } catch (error) {
    if (error.message === INVALID_NAME_ERROR) {
      return camelCase(name);
    }
    // other errors are for names that will never be valid like return or 1var
    throw new Error(`invalid script name: ${name}`);
  }
};

const buildRequires = (name: string, device?: string): string => {
  const requireSelector = `const selectors = require("./selectors/${name}.json");`;
  const requireDefaults = `${REQUIRE_QAWOLF}\n${requireSelector}`;

  if (!device) return requireDefaults;

  if (!devices[device]) {
    throw new Error(`Device ${device} not available in Playwright`);
  }

  const requires = `const { devices } = require("playwright");
${requireDefaults}
const device = devices["${device}"];`;

  return requires;
};

const buildNewContext = (device?: string): string => {
  if (!device) return 'const context = await browser.newContext();';

  const context = `const context = await browser.newContext({
      userAgent: device.userAgent,
      viewport: device.viewport
    });`;

  return context;
};

const buildSetState = (statePath?: string): string => {
  if (!statePath) return '';

  return `\n  await qawolf.setState(page, "${statePath}");`;
};

export const buildScriptTemplate = ({
  device,
  name,
  statePath,
  url,
}: BuildTemplateOptions): string => {
  const validName = buildValidVariableName(name);
  const code = `${buildRequires(name, device)}

const ${validName} = async context => {
  let page = await context.newPage();
  await page.goto("${url}");${buildSetState(statePath)}
  await qawolf.create();
};

exports.${validName} = ${validName};

if (require.main === module) {
  (async () => {
    const browser = await qawolf.launch();
    ${buildNewContext(device)}
    await qawolf.register(context);
    await ${validName}(context);
    await qawolf.stopVideos();
    await browser.close();
  })();
}`;

  return code;
};

export const buildTestTemplate = ({
  device,
  name,
  statePath,
  url,
}: BuildTemplateOptions): string => {
  const code = `${buildRequires(name, device)}

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch();
  ${buildNewContext(device)}
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('${name}', async () => {
  await page.goto("${url}");${buildSetState(statePath)}
  await qawolf.create();
});`;

  return code;
};
