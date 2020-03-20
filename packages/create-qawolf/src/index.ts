#!/usr/bin/env node
import { install as installCi } from 'playwright-ci';
import {
  logError,
  logNpmInstall,
  logUseTypeScript,
  promptRootDir,
} from './cli';
import { detectTypeScript, writeConfig } from './config';
import { addDevDependencies, readPackageJson, npmInstall } from './packageJson';

(async (): Promise<void> => {
  try {
    // create a new line for yarn create
    console.log();

    // run this first to ensure package.json
    await readPackageJson();

    const rootDir = await promptRootDir();

    const useTypeScript = await detectTypeScript();
    logUseTypeScript(useTypeScript);

    await installCi(true);

    await writeConfig({ rootDir, useTypeScript });

    const packages = await addDevDependencies(useTypeScript);
    logNpmInstall(packages);
    npmInstall();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
})();
