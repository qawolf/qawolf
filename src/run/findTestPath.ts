import { lstat } from 'fs-extra';
import glob from 'glob';
import path from 'path';

type Options = {
  name: string;
  rootDir: string;
};

const isFile = async (path: string): Promise<boolean> => {
  const stat = await lstat(path);
  return stat.isFile();
};

export const findTestPath = async ({
  name,
  rootDir,
}: Options): Promise<string> => {
  if (path.isAbsolute(name) && (await isFile(name))) return name;

  let ext = '';
  // include the expected extension in the glob
  if (!path.extname(name)) ext = '{ts,js}';

  const files = await new Promise<string[]>((resolve, reject) => {
    glob(
      `**/*${name}*${ext}`,
      { absolute: true, cwd: rootDir },
      (error, files) => {
        if (error) reject(error);
        else resolve(files);
      },
    );
  });

  if (files.length < 1) {
    throw new Error(`No files match "${name}"`);
  }

  if (files.length > 1) {
    throw new Error(`Multiple files match "${name}"`);
  }

  const testPath = files[0];

  if (!(await isFile(testPath))) {
    throw new Error(`No tests match "${name}"`);
  }

  return testPath;
};
