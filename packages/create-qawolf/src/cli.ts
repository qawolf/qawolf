import input from '@inquirer/input';
import { cyan, bold } from 'kleur';
import { getPackageJsonPath } from './packageJson';

export const logAddDevDependency = (name: string, version: string): void => {
  console.log(cyan(`npm i -D ${name}@${version}`));
};

export const logError = (error: Error): void => {
  if (error.message === 'cannot read package.json') {
    console.log(bold().yellow(`Cannot read ${getPackageJsonPath()}`));
    console.log(bold().yellow(`Create a package.json with "npm init"`));
  } else {
    console.error(error.message);
  }
};

export const logNpmInstall = (): void => console.log(cyan('npm install'));

export const logUseTypeScript = (useTypeScript: boolean): void => {
  console.log(
    cyan(
      `TypeScript ${useTypeScript ? '✔️' : '✖️'} tsconfig.json ${
        useTypeScript ? 'found' : 'not found'
      }`,
    ),
  );
};

export const promptRootDir = (): Promise<string> =>
  input({
    message: 'rootDir: Directory to create tests and scripts in',
    default: '.qawolf',
  });
