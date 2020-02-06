import { camelCase } from "lodash";
import { formatLaunch } from "./formatLaunch";

export type InitialCodeOptions = {
  createCodeSymbol: string;
  device?: string;
  isTest?: boolean;
  name: string;
  url: string;
};

type TemplateOptions = {
  createCodeSymbol: string;
  name: string;
  launch: string;
};

const buildInitialScript = ({
  name,
  launch,
  createCodeSymbol
}: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

const ${name} = async () => {
  const browser = ${launch}
  ${createCodeSymbol}
  await browser.close();
};

${name}();`;

  return code;
};

const buildInitialTest = ({
  name,
  launch,
  createCodeSymbol
}: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

describe('${name}', () => {
  let browser;

  beforeAll(async () => {
    browser = ${launch}
  });

  afterAll(() => browser.close());
  ${createCodeSymbol}
});`;

  return code;
};

export const buildInitialCode = (options: InitialCodeOptions) => {
  const templateOptions = {
    createCodeSymbol: options.createCodeSymbol,
    launch: formatLaunch(options.url, options.device),
    name: camelCase(options.name)
  };

  if (options.isTest) {
    return buildInitialTest(templateOptions);
  }

  return buildInitialScript(templateOptions);
};
