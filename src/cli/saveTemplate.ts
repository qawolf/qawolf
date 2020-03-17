import { ensureFile, writeFile, writeJson } from 'fs-extra';
import { join } from 'path';
import {
  buildScriptTemplate,
  buildTestTemplate,
  BuildTemplateOptions,
  TemplateFunction,
} from '../build-code/buildTemplate';
import { getSelectorPath } from '../create-code/create';
import { promptOverwrite } from './promptOverwrite';

type SaveTemplateOptions = BuildTemplateOptions & {
  rootDir: string;
  script?: boolean;
  templateFn?: TemplateFunction;
};

type BuildPathOptions = {
  name: string;
  rootDir: string;
  script?: boolean;
  useTypeScript?: boolean;
};

export const buildPath = ({
  name,
  rootDir,
  script,
  useTypeScript,
}: BuildPathOptions) => {
  let filename = name;
  if (!script) filename += '.test';
  filename += useTypeScript ? '.ts' : '.js';
  return join(rootDir, filename);
};

export const saveTemplate = async (
  options: SaveTemplateOptions,
): Promise<string | null> => {
  const path = buildPath(options);
  if (!(await promptOverwrite(path))) return null;

  let templateFn = options.templateFn;
  if (!templateFn) {
    templateFn = options.script ? buildScriptTemplate : buildTestTemplate;
  }

  await ensureFile(path);
  await writeFile(path, templateFn(options));

  // create a selector file so it can be imported
  const selectorPath = getSelectorPath(path);
  await ensureFile(selectorPath);
  await writeJson(selectorPath, {});

  return path;
};
