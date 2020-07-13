import { outputFile, pathExists, readFileSync } from 'fs-extra';
import inquirer from 'inquirer';
import { bold, cyan } from 'kleur';
import { join, resolve } from 'path';
import { getPackageJsonPath } from './packageJson';
import { Packages } from './types';

export const logError = (error: Error): void => {
  // create a new line for yarn create
  console.log('');

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

  Object.keys(packages).forEach((name) => {
    const version = packages[name];
    console.log(
      cyan(
        `${isYarn ? 'yarn add' : 'npm install --save-dev'} ${name}@${version}`,
      ),
    );
  });
};

export const logUseTypeScript = (useTypeScript: boolean): void => {
  const message = useTypeScript
    ? 'useTypeScript: true (tsconfig.json found)'
    : 'useTypeScript: false (tsconfig.json not found)';

  console.log(cyan(message));
};

export const promptRootDir = async (): Promise<string> => {
  // create a line break before our CLI prompt
  console.log('');

  const { rootDir } = await inquirer.prompt<{ rootDir: string }>({
    default: '.qawolf',
    message: 'rootDir: Directory to create tests in',
    name: 'rootDir',
    type: 'input',
  });

  return rootDir;
};

export const promptConfirmOverwrite = async (
  path: string,
): Promise<boolean> => {
  const answers = await inquirer.prompt<{ overwrite: boolean }>([
    {
      default: false,
      message: `"${path}" already exists, overwrite it?`,
      name: 'overwrite',
      type: 'confirm',
    },
  ]);

  return answers.overwrite;
};

export const promptOverwrite = async (path: string): Promise<boolean> => {
  const exists = await pathExists(path);
  if (!exists) return true;

  return promptConfirmOverwrite(path);
};

export const promptGithubActions = async (): Promise<void> => {
  const answers = await inquirer.prompt<{ setup: boolean }>([
    {
      default: false,
      message: `Set up CI with GitHub Actions?`,
      name: 'setup',
      type: 'confirm',
    },
  ]);

  if (!answers.setup) return;

  const outputPath = join(process.cwd(), '.github/workflows/qawolf.yml');
  const shouldWrite = await promptOverwrite(outputPath);

  const template = readFileSync(
    resolve(__dirname, `../static/github.yml`),
    'utf8',
  );

  if (shouldWrite) {
    await outputFile(outputPath, template, 'utf8');
    console.log(`Saved GitHub Actions template to ${outputPath}`);
  }
};
