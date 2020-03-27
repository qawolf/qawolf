import { spawn } from 'child_process';
import { buildArguments } from './runJest';
import { loadConfig } from '../config';

(async () => {
  const config = loadConfig();

  const args = buildArguments({
    args: [],
    // browsers,
    config: config.config,
    repl: true,
    rootDir: config.rootDir,
    testTimeout: config.testTimeout,
  });

  const child = spawn('npx', ['qawolf', 'test', ...args, 'keys'], {
    env: {
      //   // ...env,
      //   // override env with process.env
      //   // ex. for unit tests we want QAW_BROWSER to override cli one
      ...process.env,
    },
    stdio: 'inherit',
  });

  child.on('error', function (error) {
    console.log('child process error with', error);
  });

  child.on('exit', function (code, signal) {
    console.log(
      'child process exited with ' + `code ${code} and signal ${signal}`,
    );
  });
})();
