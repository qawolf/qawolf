#!/usr/bin/env node
import {
  logError,
  logInstallDependencies,
  logUseTypeScript,
  promptGithubActions,
  promptRootDir,
} from './cli';
import { detectTypeScript, detectYarn, writeConfig } from './config';
import {
  addDevDependencies,
  installDependencies,
  readPackageJson,
} from './packageJson';

export const create = async (): Promise<void> => {
  try {
    // run this first to ensure package.json
    await readPackageJson();

    const rootDir = await promptRootDir();

    const useTypeScript = await detectTypeScript();
    logUseTypeScript(useTypeScript);

    await promptGithubActions();

    await writeConfig({ rootDir, useTypeScript });

    const packages = await addDevDependencies(useTypeScript);

    const isYarn = detectYarn();
    logInstallDependencies(packages, isYarn);
    installDependencies(isYarn);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};
