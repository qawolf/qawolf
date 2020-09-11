import callsites from 'callsites';
import Debug from 'debug';
import { pathExists, readFile } from 'fs-extra';
import { bold } from 'kleur';
import { findLast } from 'lodash';
import { CreateManager } from './CreateManager';
import { getLineIncludes } from './format';
import { CREATE_HANDLE } from './patchCode';
import { Registry } from '../utils';

const debug = Debug('qawolf:create');

export const getCreatePath = async (
  callerFileNames: string[],
): Promise<string> => {
  debug(`search caller files for ${CREATE_HANDLE} %j`, callerFileNames);

  const codes = await Promise.all(
    callerFileNames.map(async (filename) => {
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

export const create = async (url?: string): Promise<void> => {
  const registryData = Registry.instance().data();
  const context = registryData.context;
  if (!context) {
    throw new Error(
      'No context found. Call qawolf.register(context) before qawolf.create()',
    );
  }

  const callerFileNames = callsites().map((c) => c.getFileName());

  const codePath = await getCreatePath(callerFileNames);

  const manager = await CreateManager.create({
    codePath,
    context,
  });

  if (context.pages().length === 0) {
    const firstPage = await context.newPage();
    if (url) await firstPage.goto(url);
  }

  console.log(bold().blue('🐺  QA Wolf is ready to create code!'));

  await manager.finalize();

  if (registryData.browser) {
    await registryData.browser.close();
  }

  // if the process does not exit on its own, force it to exit
  setTimeout(() => process.exit(), 500);
};
