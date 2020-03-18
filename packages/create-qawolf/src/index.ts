#!/usr/bin/env node
// import { install as installCi } from 'playwright-ci';
import { logError, logUseTypeScript, promptRootDir } from './cli';
import { detectTypeScript } from './config';
import { addDependencies, readPackageJson } from './packageJson';

(async () => {
  try {
    // run this first to ensure package.json
    await readPackageJson();

    const useTypeScript = await detectTypeScript();
    if (useTypeScript) logUseTypeScript();

    const rootDir = await promptRootDir();
    console.log('rootDir', rootDir);

    await addDependencies(useTypeScript);

    // await writeConfig({ rootDir, useTypeScript });

    // await installCi();

    // npmInstall();
  } catch (error) {
    logError(error);
    process.exit(1);
  }
})();
