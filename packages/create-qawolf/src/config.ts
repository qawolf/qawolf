import { promises as fs } from 'fs';
import glob from 'glob';

type ConfigOptions = {
  rootDir: string;
  useTypeScript: boolean;
};

export const detectTypeScript = async (): Promise<boolean> => {
  return new Promise(resolve => {
    glob('tsconfig*.json', (error, files) => {
      if (error) resolve(false);
      else resolve(files.length > 0);
    });
  });
};

export const writeConfig = async ({
  rootDir,
  useTypeScript,
}: ConfigOptions): Promise<void> => {
  // TODO test the preset escaping works on windows :/
  const config = `module.exports = {
  config: '${useTypeScript ? '{ \\"preset\\": \\"ts-jest\\" }' : '{}'}',
  rootDir: '${rootDir}',
  testTimeout: 60000,
  useTypeScript: ${useTypeScript}
}`;

  // TODO prompt overwrite? playwright-ci
  await fs.writeFile('qawolf.config.js', config + '\n', 'utf8');
};
