import { promptOverwrite } from 'create-qawolf';
import { ensureFile, writeFile } from 'fs-extra';
import { join } from 'path';
import {
  BuildTemplateOptions,
  buildTemplate,
  TemplateFunction,
} from '../build-code/buildTemplate';

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
  const code = await templateFn(options);

  await ensureFile(path);
  await writeFile(path, code);

  return path;
};
