import Debug from 'debug';
import { FullVersion } from 'package-json';
import { promises as fs } from 'fs';
import { join } from 'path';

const debug = Debug('packageJson');

export const addDependencies = async (
  useTypeScript: boolean,
): Promise<void> => {
  if (useTypeScript) {
  }
};

export const getPackageJsonPath = (): string =>
  join(process.cwd(), 'package.json');

export const readPackageJson = async (): Promise<FullVersion> => {
  try {
    const path = getPackageJsonPath();
    const packageJson = await fs.readFile(path, 'utf8');
    return JSON.parse(packageJson) as FullVersion;
  } catch (error) {
    debug('cannot read package.json %s', error.message);
    throw new Error('cannot read package.json');
  }
};
