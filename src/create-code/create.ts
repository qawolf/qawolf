import { CreateManager } from './CreateManager';
import { BrowserContext } from 'playwright';

type CreateOptions = {
  codePath?: string;
  context?: BrowserContext;
  selectorPath?: string;
};

const getPaths = (codePath: string): string => {
  // const rootPath = options.path || `${process.cwd()}/.qawolf`;
  // let codePath = options.codePath;
  // if (!codePath) {
  //   codePath = options.isTest
  //     ? join(rootPath, 'tests', `${options.name}.test.js`)
  //     : join(rootPath, 'scripts', `${options.name}.js`);
  //   }
  //   const selectorPath =
  //     options.selectorPath || join(rootPath, 'selectors', `${options.name}.json`);
  //   return { codePath, selectorPath };
  // };
  // return join('../selectors', codePath);
};

export const create = async (options: CreateOptions = {}): Promise<void> => {
  // TODO find the last caller file that has qawolf.create
  // if not.. throw an error!!!
  // TODO set repl context...
  // must not be async for the last callsite to be the caller file
  // const callerFileNames = callsites().map(c => c.getFileName());
  // const callerPath = last(callerFileNames);

  // const selectorPath = getSelectorPath(codePath);
  // debug(`create code at ${codePath} selectors at ${selectorPath}`);

  return CreateManager.run({
    codePath,
    context,
    selectorPath,
  });
};
