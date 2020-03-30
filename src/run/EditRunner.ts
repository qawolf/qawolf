import { Config } from '../config';

type StartOptions = {
  codePath: string;
  config: Config;
  env?: NodeJS.ProcessEnv;
  isScript?: boolean;
};

export class EditRunner {
  public static async start(options: StartOptions) {
    console.log('edit', options);
    //     codePath,
    //     config,
    //     env: {
    //       QAW_CREATE: 'true',
    //     },
    //     isScript: options.isScript,
  }
}

// export const runCommand = (
//   command: string,
//   env: NodeJS.ProcessEnv = {},
// ): void => {
//   // log the command to show the user how to run it directly
//   console.log(`${command}\n`);

//   execSync(command, {
//     stdio: 'inherit',
//     env: {
//       ...env,
//       // override env with process.env
//       // ex. for unit tests we want QAW_BROWSER to override cli one
//       ...process.env,
//     },
//   });
// };

// export const runEdit = ({ config, ...options }: EditOptions): void => {
//   const env: NodeJS.ProcessEnv = {
//     ...options.env,
//     QAW_EDIT: 'true',
//     QAW_HEADLESS: 'false',
//   };

//   if (options.isScript) {
//     runCommand(
//       `${config.useTypeScript ? 'ts-node -D 6133' : 'node'} ${
//         options.codePath
//       }`,
//       {
//         ...env,
//         QAW_BROWSER: 'chromium',
//       },
//     );
//     return;
//   }

//   runJest({
//     browsers: ['chromium'],
//     config: config.config,
//     env,
//     repl: true,
//     rootDir: config.rootDir,
//     testPath: options.codePath,
//     testTimeout: config.testTimeout,
//   });
// };
