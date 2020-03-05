import { ensureFile, pathExists, writeFile } from 'fs-extra';
import { prompt } from 'inquirer';
import { join } from 'path';
import {
  buildScriptTemplate,
  buildTestTemplate,
} from '../build-code/buildTemplate';

interface SaveTemplateOptions {
  device?: string;
  name: string;
  rootDir?: string;
  script?: boolean;
  url: string;
}

const buildTemplate = ({
  device,
  name,
  rootDir,
  script,
  url,
}: SaveTemplateOptions): { path: string; template: string } => {
  const folder = rootDir || join(process.cwd(), '.qawolf');

  if (script) {
    const path = join(folder, 'scripts', `${name}.js`);
    const template = buildScriptTemplate({ device, name, url });

    return { path, template };
  }

  const path = join(folder, 'tests', `${name}.test.js`);
  const template = buildTestTemplate({ device, name, url });

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
): Promise<void> => {
  const { path, template } = buildTemplate(options);

  if (!(await shouldSaveTemplate(path))) return;

  await ensureFile(path);
  return writeFile(path, template);
};
