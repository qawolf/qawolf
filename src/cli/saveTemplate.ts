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
  rootDir?: string;
  script?: boolean;
  statePath?: string;
  url: string;
}

const buildTemplate = ({
  device,
  name,
  rootDir,
  script,
  statePath,
  url,
}: SaveTemplateOptions): { path: string; template: string } => {
  const folder = rootDir || join(process.cwd(), '.qawolf');

  if (script) {
    const path = join(folder, 'scripts', `${name}.js`);
    const template = buildScriptTemplate({ device, name, statePath, url });

    return { path, template };
  }

  const path = join(folder, 'tests', `${name}.test.js`);
  const template = buildTestTemplate({ device, name, statePath, url });

  return { path, template };
};

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
  const { path, template } = buildTemplate(options);
  if (!(await shouldSaveTemplate(path))) return null;

  await ensureFile(path);
  await writeFile(path, template);

  // create a selector file so it can be imported
  const selectorPath = getSelectorPath(path);
  await ensureFile(selectorPath);
  await writeJson(selectorPath, {});

  return path;
};
