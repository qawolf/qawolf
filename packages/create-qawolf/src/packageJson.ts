import { execSync } from 'child_process';
import Debug from 'debug';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Packages, PackageJson } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { devDependencies: selfDevDependencies } = require('../package.json');

const debug = Debug('create-qawolf:packageJson');

const defaultPackages: Packages = {
  jest: selfDevDependencies['jest'],
  playwright: '0.11.1-next.1583909126688',
  qawolf: '0.12.3-1',
};

const typeScriptPackages: Packages = {
  ...defaultPackages,
  '@types/debug': selfDevDependencies['@types/debug'],
  '@types/jest': selfDevDependencies['@types/jest'],
  '@types/node': selfDevDependencies['@types/node'],
  'ts-jest': selfDevDependencies['ts-jest'],
  'ts-node': selfDevDependencies['ts-node'],
};

export const getPackageJsonPath = (): string =>
  join(process.cwd(), 'package.json');

export const readPackageJson = async (): Promise<PackageJson> => {
  try {
    const path = getPackageJsonPath();
    const packageJson = await fs.readFile(path, 'utf8');
    return JSON.parse(packageJson) as PackageJson;
  } catch (error) {
    debug('cannot read package.json %s', error.message);
    throw new Error('cannot read package.json');
  }
};

export const addDevDependencies = async (
  useTypeScript: boolean,
): Promise<Packages> => {
  const packageJson = await readPackageJson();

  const devDependencies = packageJson.devDependencies || {};

  const packages = useTypeScript ? typeScriptPackages : defaultPackages;

  Object.keys(packages).forEach(name => {
    const version = packages[name];
    devDependencies[name] = version;
  });

  const sortedDevDependencies = {};
  Object.keys(devDependencies)
    .sort((k1, k2) => {
      if (k1 < k2) return -1;
      if (k1 > k2) return +1;
      return 0;
    })
    .forEach(key => (sortedDevDependencies[key] = devDependencies[key]));

  packageJson.devDependencies = sortedDevDependencies;

  const path = getPackageJsonPath();
  debug('write updated package.json to %s', path);

  await fs.writeFile(
    path,
    // https://github.com/npm/init-package-json/blob/2b5d21ea3e3434f8e0d6050cd2733d5062b830c6/init-package-json.js#L106
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8',
  );

  return packages;
};

export const npmInstall = (): void => {
  execSync('npm install', { stdio: 'inherit' });
};
