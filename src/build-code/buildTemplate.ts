import { camelCase } from 'lodash';
import { devices } from 'playwright';

export interface BuildTemplateOptions {
  device?: string;
  name: string;
  statePath?: string;
  url: string;
  useTypeScript?: boolean;
}

export type TemplateFunction = (
  options: BuildTemplateOptions,
) => string | Promise<string>;

interface BuildImportsOptions {
  device?: string;
  name: string;
  useTypeScript?: boolean;
}

export const buildValidVariableName = (name: string): string => {
  try {
    // try creating variable with specified name
    eval(`const ${name} = 0`);
    return name;
  } catch (error) {
    if (error.message === 'Missing initializer in const declaration') {
      return camelCase(name);
    }
    // other errors are for names that will never be valid like return or 1var
    throw new Error(`invalid script name: ${name}`);
  }
};

export const buildImports = ({
  device,
  name,
  useTypeScript,
}: BuildImportsOptions): string => {
  if (device && !devices[device]) {
    throw new Error(`Device ${device} not available in Playwright`);
  }

  let imports = '';

  if (device) {
    if (useTypeScript) {
      imports += 'import { Browser, Page, devices } from "playwright";\n';
    } else {
      imports += 'const { devices } = require("playwright");\n';
    }
  }

  if (useTypeScript && !device) {
    imports += 'import { Browser, Page } from "playwright";\n';
  }

  if (useTypeScript) {
    imports += 'import qawolf from "qawolf";\n';
  } else {
    imports += 'const qawolf = require("qawolf");\n';
  }

  imports += `const selectors = require("./selectors/${name}.json");`;

  if (device) {
    imports += `\nconst device = devices["${device}"];`;
  }

  return imports;
};

export const buildNewContext = (device?: string): string => {
  if (!device) return 'const context = await browser.newContext();';

  const context = `const context = await browser.newContext({ ...device });`;

  return context;
};

const buildSetState = (statePath?: string): string => {
  if (!statePath) return '';

  return `\n  await qawolf.setState(page, "${statePath}");`;
};

export const buildTemplate: TemplateFunction = ({
  device,
  name,
  statePath,
  url,
  useTypeScript,
}: BuildTemplateOptions): string => {
  const code = `${buildImports({ device, name, useTypeScript })}

let browser${useTypeScript ? ': Browser' : ''};
let page${useTypeScript ? ': Page' : ''};

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
