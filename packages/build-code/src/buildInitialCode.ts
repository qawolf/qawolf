import { camelCase } from "lodash";
import { buildLaunch } from "./buildLaunch";

export type InitialCodeOptions = {
  device?: string;
  isTest?: boolean;
  name: string;
  patchHandle: string;
  url: string;
};

type TemplateOptions = {
  launch: string;
  name: string;
  patchHandle: string;
};

const buildInitialScript = ({ name, launch, patchHandle }: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

const ${name} = async () => {
  const browser = ${launch}
  ${patchHandle}
  await browser.close();
};

${name}();`;

  return code;
};

const buildInitialTest = ({ name, launch, patchHandle }: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

describe('${name}', () => {
  let browser;

  beforeAll(async () => {
    browser = ${launch}
  });

  afterAll(() => browser.close());
  ${patchHandle}
});`;

  return code;
};

export const buildInitialCode = (options: InitialCodeOptions) => {
  const templateOptions = {
    launch: buildLaunch(options.url, options.device),
    name: camelCase(options.name),
    patchHandle: options.patchHandle
  };

  if (options.isTest) {
    return buildInitialTest(templateOptions);
  }

  return buildInitialScript(templateOptions);
};
