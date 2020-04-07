import { ensureFile, writeFile, writeJson } from 'fs-extra';
import { join } from 'path';
import { promptOverwrite } from 'playwright-ci';
import {
  BuildTemplateOptions,
  buildTemplate,
  TemplateFunction,
} from '../build-code/buildTemplate';
import { getSelectorPath } from '../create-code/create';

type BuildPathOptions = {
  name: string;
  rootDir: string;
  useTypeScript?: boolean;
};

type SaveTemplateOptions = BuildTemplateOptions & {
  rootDir: string;
  templateFn?: TemplateFunction;
};

export const buildPath = ({
  name,
  rootDir,
  useTypeScript,
}: BuildPathOptions): string => {
  const extension = useTypeScript ? 'ts' : 'js';
  const filename = `${name}.test.${extension}`;
  return join(rootDir, filename);
};

export const saveTemplate = async (
  options: SaveTemplateOptions,
): Promise<string | null> => {
  const path = buildPath(options);
  if (!(await promptOverwrite(path))) return null;

  const templateFn = options.templateFn || buildTemplate;

  await ensureFile(path);
  await writeFile(path, templateFn(options));

  // create a selector file so it can be imported
  const selectorPath = getSelectorPath(path);
  await ensureFile(selectorPath);
  await writeJson(selectorPath, {});

  return path;
};
