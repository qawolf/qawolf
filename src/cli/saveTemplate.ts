import { ensureFile, pathExists, writeFile, writeJson } from 'fs-extra';
import { prompt } from 'inquirer';
import { join } from 'path';
import {
  buildScriptTemplate,
  buildTestTemplate,
} from '../build-code/buildTemplate';
import { getSelectorPath } from '../create-code/create';

interface SaveTemplateOptions {
  device?: string;
  name: string;
  rootDir: string;
  script?: boolean;
  statePath?: string;
  url: string;
}

const buildPath = ({ name, rootDir, script }: SaveTemplateOptions) =>
  join(rootDir, script ? `${name}.js` : `${name}.test.js`);

export const shouldSaveTemplate = async (path: string): Promise<boolean> => {
  const exists = await pathExists(path);
  if (!exists) return true;

  const { overwrite } = await prompt<{ overwrite: boolean }>([
    {
      message: `"${path}" already exists, overwrite it?`,
      name: 'overwrite',
      type: 'confirm',
    },
  ]);

  return overwrite;
};

export const saveTemplate = async (
  options: SaveTemplateOptions,
): Promise<string | null> => {
  const path = buildPath(options);
  if (!(await shouldSaveTemplate(path))) return null;

  const template = options.script
    ? buildScriptTemplate(options)
    : buildTestTemplate(options);

  await ensureFile(path);
  await writeFile(path, template);

  // create a selector file so it can be imported
  const selectorPath = getSelectorPath(path);
  await ensureFile(selectorPath);
  await writeJson(selectorPath, {});

  return path;
};
