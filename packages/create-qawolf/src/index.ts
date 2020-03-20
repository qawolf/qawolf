#!/usr/bin/env node
import { install as installCi } from 'playwright-ci';
import { logError, logUseTypeScript, promptRootDir } from './cli';
import { detectTypeScript, writeConfig } from './config';
import { addDevDependencies, readPackageJson, npmInstall } from './packageJson';

(async (): Promise<void> => {
  try {
    // run this first to ensure package.json
    await readPackageJson();

    const rootDir = await promptRootDir();

    const useTypeScript = await detectTypeScript();
    logUseTypeScript(useTypeScript);

    await installCi(true);

    await addDevDependencies(useTypeScript);
    await writeConfig({ rootDir, useTypeScript });

    npmInstall();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
})();
