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
  useTypeScript,
}: BuildImportsOptions): string => {
  if (device && !devices[device]) {
    throw new Error(`Device ${device} not available in Playwright`);
  }

  let imports = '';

  if (useTypeScript) {
    if (device) {
      imports = 'import { Browser, BrowserContext, devices } from "playwright";';
    } else {
      imports = 'import { Browser, BrowserContext } from "playwright";';
    }

    imports += '\nimport qawolf from "qawolf";';
  } else {
    // not typescript
    if (device) {
      imports = 'const { devices } = require("playwright");\n';
    }

    imports += 'const qawolf = require("qawolf");';
  }

  if (device) {
    imports += `\nconst device = devices["${device}"];`;
  }

  return imports;
};

export const buildNewContext = (device?: string): string => {
  if (!device) return 'context = await browser.newContext();';

  const context = `context = await browser.newContext({ ...device });`;

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
  const code = `${buildImports({ device, useTypeScript })}

let browser${useTypeScript ? ': Browser' : ''};
let context${useTypeScript ? ': BrowserContext' : ''};

beforeAll(async () => {
  browser = await qawolf.launch();
  ${buildNewContext(device)}
  await qawolf.register(context);
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test("${name}", async () => {${buildSetState(statePath)}
  await qawolf.create(${url && url.length ? `"${url}"` : ''});
});`;

  return code;
};
