import { registry } from "@qawolf/repl";
import { Url } from "url";
import { CodeCreator } from "./CodeCreator";
import { promptCodeCreator } from "./promptCodeCreator";

type CreateOptions = {
  codePath?: string;
  debug?: boolean;
  device?: string;
  isTest?: boolean;
  name: string;
  path?: string;
  selectorPath?: string;
  url: Url;
};

const startCodeCreator = async (options: CreateOptions) => {
  const rootPath = options.path || `${process.cwd()}/.qawolf`;

  let codePath = options.codePath;
  if (!codePath) {
    codePath = options.isTest
      ? join(rootPath, "tests", `${options.name}.test.js`)
      : join(rootPath, "scripts", `${options.name}.js`);
  }

  const selectorPath =
    options.selectorPath || join(rootPath, "selectors", `${options.name}.json`);

  const codeCreator = await CodeCreator.start({
    codePath,
    device: options.device,
    isTest: options.isTest,
    name: options.name,
    selectorPath,
    url: options.url.href!
  });

  return codeCreator;
};

export const create = async () => {
  const browser = registry.context();

  const codeCreator = await startCodeCreator();

  // TODO load the current browser if it is available
  // otherwise launch a new browser?
  await browser.recordEvents();

  const codeCreator = await CodeCreator.start();
  await promptCodeCreator({ codeCreator });
};
