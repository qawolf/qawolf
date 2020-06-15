import { writeFile } from 'fs-extra';
import glob from 'glob';
import { resolve } from 'path';
import { promptOverwrite } from './cli';

type ConfigOptions = {
  rootDir: string;
  useTypeScript: boolean;
};

export const detectTypeScript = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    glob('tsconfig*.json', (error, files) => {
      if (error) resolve(false);
      else resolve(files.length > 0);
    });
  });
};

export const detectYarn = (): boolean =>
  (process.env.npm_execpath || '').includes('yarn');

export const writeConfig = async ({
  rootDir,
  useTypeScript,
}: ConfigOptions): Promise<void> => {
  const jestConfig = useTypeScript
    ? // we reference a file instead of inlining because
      // each shell uses different escapes characters
      'node_modules/qawolf/ts-jest.config.json'
    : 'node_modules/qawolf/js-jest.config.json';

  const configFile = `module.exports = {
  config: "${jestConfig}",
  rootDir: "${rootDir}",
  testTimeout: 60000,
  useTypeScript: ${useTypeScript}
}\n`;

  const configPath = resolve('qawolf.config.js');
  if (!(await promptOverwrite(configPath))) return;

  await writeFile(configPath, configFile, 'utf8');
};
