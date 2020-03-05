import { ensureFile, writeFile } from 'fs-extra';
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
}

// when running it pass the paths via environment variable
export const saveTemplate = async ({
  name,
  rootDir,
  script,
}: SaveTemplateOptions): Promise<void> => {
  const folder = rootDir || join(process.cwd(), '.qawolf');

  let path: string;
  let template: string;

  if (script) {
    path = join(folder, 'scripts', `${name}.js`);
    template = buildScriptTemplate(name);
  } else {
    path = join(folder, 'tests', `${name}.test.js`);
    template = buildTestTemplate(name);
  }

  await ensureFile(path);
  return writeFile(path, template);
};
