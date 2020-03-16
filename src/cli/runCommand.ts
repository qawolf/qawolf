import { execSync } from 'child_process';

export const runCommand = (
  command: string,
  env: NodeJS.ProcessEnv = {},
): void => {
  // log the command to show the user how to run it directly
  console.log(`${command}\n`);

  execSync(command, {
    stdio: 'inherit',
    env: {
      ...env,
      // override env with process.env
      // ex. for unit tests we want QAW_BROWSER to override cli one
      ...process.env,
    },
  });
};
