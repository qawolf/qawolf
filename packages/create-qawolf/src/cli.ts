import input from '@inquirer/input';
import { bold, cyan } from 'kleur';
import { getPackageJsonPath } from './packageJson';
import { Packages } from './types';

export const logError = (error: Error): void => {
  // create a new line for yarn create
  console.log();

  if (error.message === 'cannot read package.json') {
    console.log(bold().yellow(`Cannot read ${getPackageJsonPath()}`));
    console.log(bold().yellow(`Create a package.json with "npm init"`));
  } else {
    console.error(error.message);
  }
};

export const logInstallDependencies = (
  packages: Packages,
  isYarn = false,
): void => {
  console.log(cyan(`Installing dependencies`));

  Object.keys(packages).forEach(name => {
    const version = packages[name];
    console.log(
      cyan(
        `${isYarn ? 'yarn add' : 'npm install --save-dev'} ${name}@${version}`,
      ),
    );
  });
};

export const logUseTypeScript = (useTypeScript: boolean): void => {
  console.log(
    cyan(
      `TypeScript ${useTypeScript ? '✔️' : '✖️'} tsconfig.json ${
        useTypeScript ? 'found' : 'not found'
      }`,
    ),
  );
};

export const promptRootDir = (): Promise<string> => {
  // create a line break before our CLI prompt
  console.log();

  return input({
    message: 'rootDir: Directory to create tests in',
    default: '.qawolf',
  });
};
