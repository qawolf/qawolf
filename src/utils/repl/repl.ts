import '../await-outside';
import { addAwaitOutsideToReplServer } from 'await-outside';
import Debug from 'debug';
import { bold } from 'kleur';
import { start, REPLServer } from 'repl';
import { ReplContext } from './ReplContext';
import { addScreenshotCommand } from './addScreenshotCommand';

const debug = Debug('qawolf:repl');

export type Callback<S = void, T = void> = (data?: S) => T;

export const repl = (
  context?: {},
  callback?: Callback<REPLServer>,
): Promise<void> => {
  /**
   * Create a REPL and resolve when it is closed.
   */
  if (context) {
    Object.keys(context).forEach((key) => ReplContext.set(key, context[key]));
  }

  console.log(
    bold().yellow(
      'Type .exit to close the repl and continue running your code',
    ),
  );

  const replServer = start({
    terminal: true,
    useGlobal: true,
  });

  addAwaitOutsideToReplServer(replServer);

  addScreenshotCommand(replServer);

  const setContext = (): void => {
    const data = ReplContext.data();
    Object.keys(data).forEach((key) => (replServer.context[key] = data[key]));
  };
  setContext();
  ReplContext.instance().on('change', setContext);

  if (callback) {
    callback(replServer);
  }

  return new Promise((resolve) => {
    replServer.on('exit', () => {
      debug('exit');
      resolve();
    });
  });
};
