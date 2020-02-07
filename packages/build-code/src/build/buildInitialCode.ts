import { camelCase } from "lodash";
import { buildLaunch } from "./buildLaunch";
import { PATCH_HANDLE } from "../code";

export type InitialCodeOptions = {
  device?: string;
  isTest?: boolean;
  name: string;
  url: string;
};

type TemplateOptions = {
  name: string;
  launch: string;
};

const buildInitialScript = ({ name, launch }: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

const ${name} = async () => {
  const browser = ${launch}
  ${PATCH_HANDLE}
  await browser.close();
};

${name}();`;

  return code;
};

const buildInitialTest = ({ name, launch }: TemplateOptions) => {
  const code = `const { launch } = require("qawolf");
const selectors = require("../selectors/${name}");

describe('${name}', () => {
  let browser;

  beforeAll(async () => {
    browser = ${launch}
  });

  afterAll(() => browser.close());
  ${PATCH_HANDLE}
});`;

  return code;
};

export const buildInitialCode = (options: InitialCodeOptions) => {
  const templateOptions = {
    launch: buildLaunch(options.url, options.device),
    name: camelCase(options.name)
  };

  if (options.isTest) {
    return buildInitialTest(templateOptions);
  }

  return buildInitialScript(templateOptions);
};
