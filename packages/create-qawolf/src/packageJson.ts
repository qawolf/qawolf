import { execSync } from 'child_process';
import Debug from 'debug';
import { readFile, writeFile } from 'fs-extra';
import { join } from 'path';
import { Packages, PackageJson } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const selfPkg = require('../package.json');

const debug = Debug('create-qawolf:packageJson');

const defaultPackages: Packages = {
  jest: selfPkg.devDependencies['jest'],
  qawolf: selfPkg.createDevDependencies['qawolf'],
};

const typeScriptPackages: Packages = {
  ...defaultPackages,
  '@types/debug': selfPkg.devDependencies['@types/debug'],
  '@types/jest': selfPkg.devDependencies['@types/jest'],
  '@types/node': selfPkg.devDependencies['@types/node'],
  'ts-jest': selfPkg.devDependencies['ts-jest'],
};

export const getPackageJsonPath = (): string =>
  join(process.cwd(), 'package.json');

export const readPackageJson = async (): Promise<PackageJson> => {
  try {
    const path = getPackageJsonPath();
    const packageJson = await readFile(path, 'utf8');
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

  const dependencies = packageJson.dependencies || {};

  const packages = {
    ...(useTypeScript ? typeScriptPackages : defaultPackages),
  };

  const isCreateReactApp = dependencies['react-scripts'];
  if (isCreateReactApp) {
    // create-react-app will throw an error if you install another jest
    delete packages['jest'];
  }

  const devDependencies = packageJson.devDependencies || {};

  Object.keys(packages).forEach((name) => {
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
    .forEach((key) => (sortedDevDependencies[key] = devDependencies[key]));

  packageJson.devDependencies = sortedDevDependencies;

  const path = getPackageJsonPath();
  debug('write updated package.json to %s', path);

  await writeFile(
    path,
    // https://github.com/npm/init-package-json/blob/2b5d21ea3e3434f8e0d6050cd2733d5062b830c6/init-package-json.js#L106
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8',
  );

  return packages;
};

export const installDependencies = (useYarn = false): void => {
  execSync(useYarn ? 'yarn' : 'npm install', { stdio: 'inherit' });
};
