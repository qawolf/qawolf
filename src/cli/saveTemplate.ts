import { ensureFile, writeFile, writeJson } from 'fs-extra';
import { join } from 'path';
import { promptOverwrite } from 'playwright-ci';
import {
  buildScriptTemplate,
  buildTestTemplate,
  BuildTemplateOptions,
} from '../build-code/buildTemplate';
import { getSelectorPath } from '../create-code/create';

type BuildPathOptions = {
  isScript?: boolean;
  name: string;
  rootDir: string;
  useTypeScript?: boolean;
};

type SaveTemplateOptions = BuildTemplateOptions & {
  rootDir: string;
};

export const buildPath = ({
  name,
  rootDir,
  isScript,
  useTypeScript,
}: BuildPathOptions): string => {
  let filename = name;
  if (!isScript) filename += '.test';
  filename += useTypeScript ? '.ts' : '.js';
  return join(rootDir, filename);
};

export const saveTemplate = async (
  options: SaveTemplateOptions,
): Promise<string | null> => {
  const path = buildPath(options);
  if (!(await promptOverwrite(path))) return null;

  const templateFn = options.isScript ? buildScriptTemplate : buildTestTemplate;

  await ensureFile(path);
  await writeFile(path, templateFn(options));

  // create a selector file so it can be imported
  const selectorPath = getSelectorPath(path);
  await ensureFile(selectorPath);
  await writeJson(selectorPath, {});

  return path;
};
