import callsites from 'callsites';
import Debug from 'debug';
import { last, join } from 'lodash';

const debug = Debug('qawolf:create');

const getSelectorPath = (codePath: string): string => {
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
  return join('../selectors', codePath);
};

export const create = () => {
  // must not be async for the last callsite to be the caller file
  const callerFileNames = callsites().map(c => c.getFileName());
  const codePath = last(callerFileNames);
  const selectorPath = getSelectorPath(codePath);
  debug(`create code at ${codePath} selectors at ${selectorPath}`);
  // TODO create({ context, codePath, selectorPath });
};
