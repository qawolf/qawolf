import { ensureFile } from 'fs-extra';
import { join } from 'path';
import { buildTestTemplate } from './buildTemplate';

interface SaveTemplateOptions {
  name: string;
  rootDir?: string;
  script: boolean;
}

// when running it pass the paths via environment variable
// TODO which template to use when saving test
export const saveTemplate = async ({
  name,
  rootDir,
  script,
}: SaveTemplateOptions): Promise<void> => {
  const folder = rootDir || join(process.cwd(), '.qawolf');

  if (script) {
    return;
  }

  const testFile = join(folder, 'tests', `${name}.test.js`);
  await ensureFile(testFile);
  const testCode = buildTestTemplate(name);
};
