#!/usr/bin/env node
import { install as installCi } from 'playwright-ci';
import {
  logError,
  logInstallDependencies,
  logUseTypeScript,
  promptRootDir,
} from './cli';
import { detectTypeScript, writeConfig } from './config';
import {
  addDevDependencies,
  readPackageJson,
  installDependencies,
} from './packageJson';

(async (): Promise<void> => {
  try {
    const useYarn = process.argv[process.argv.length - 1] === '--yarn';

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

    logInstallDependencies(packages, useYarn);

    installDependencies(useYarn);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
})();
