import callsites from 'callsites';
import Debug from 'debug';
import { pathExists, readFile } from 'fs-extra';
import { bold } from 'kleur';
import { findLast } from 'lodash';
import { basename, dirname, join } from 'path';
import { BrowserContext } from 'playwright';
import { ReplContext } from 'playwright-utils';
import { CREATE_HANDLE } from './CodeUpdater';
import { CreateManager } from './CreateManager';
import { getLineIncludes } from './format';

type CreateOptions = {
  codePath?: string;
  context?: BrowserContext;
  // used for testing
  onReady?: () => void;
  selectorPath?: string;
};

const debug = Debug('qawolf:create');

export const getCodePath = async (
  callerFileNames: string[],
): Promise<string> => {
  debug(`search caller files for ${CREATE_HANDLE} %j`, callerFileNames);

  const codes = await Promise.all(
    callerFileNames.map(async filename => {
      let code = '';

      if (await pathExists(filename)) {
        code = await readFile(filename, 'utf8');
      }

      return { code, filename };
    }),
  );

  const item = findLast(
    codes,
    ({ code }) => !!getLineIncludes(code, CREATE_HANDLE),
  );

  if (!item) {
    throw new Error(`Could not find ${CREATE_HANDLE} in caller`);
  }

  return item.filename;
};

export const getSelectorPath = (codePath: string): string => {
  const codeName = basename(codePath).split('.')[0];
  return join(dirname(codePath), '../selectors', `${codeName}.json`);
};

export const create = async (options: CreateOptions = {}): Promise<void> => {
  const context: BrowserContext =
    options.context || (ReplContext.data() as any).context;
  if (!context) {
    throw new Error(
      'No context found. Call qawolf.register(context) before qawolf.create() or qawolf.create({ context })',
    );
  }

  let codePath = options.codePath;
  if (!codePath) {
    const callerFileNames = callsites().map(c => c.getFileName());
    codePath = await getCodePath(callerFileNames);
  }

  const selectorPath = options.selectorPath || getSelectorPath(codePath);

  const manager = await CreateManager.create({
    codePath,
    context,
    selectorPath,
  });

  console.log(bold().blue('🐺  QA Wolf is ready to create code!'));
  if (options.onReady) options.onReady();

  await manager.finalize();
};
