#!/usr/bin/env node
// import { install as installCi } from 'playwright-ci';
import { logError, logUseTypeScript, promptRootDir } from './cli';
import { detectTypeScript } from './config';
import { addDependencies, readPackageJson } from './packageJson';

(async () => {
  try {
    // run this first to ensure package.json
    await readPackageJson();

    await promptRootDir();

    const useTypeScript = await detectTypeScript();
    if (useTypeScript) logUseTypeScript();

    await addDependencies(useTypeScript);

    // await writeConfig({ rootDir, useTypeScript });

    // await installCi();

    // npmInstall();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
})();
