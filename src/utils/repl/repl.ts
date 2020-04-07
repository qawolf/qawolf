import '../await-outside';
import { addAwaitOutsideToReplServer } from 'await-outside';
import Debug from 'debug';
import { bold } from 'kleur';
import { start, REPLServer } from 'repl';
import { addScreenshotCommand } from './addScreenshotCommand';
import { setReplContext } from './setReplContext';
import { WatchHooks } from '../../watch/WatchHooks';

const debug = Debug('qawolf:repl');

export type Callback<S = void, T = void> = (data?: S) => T;

export const repl = (
  context?: {},
  callback?: Callback<REPLServer>,
): Promise<void> => {
  /**
   * Create a REPL and resolve when it is closed.
   */
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

  setReplContext(replServer.context, context);

  WatchHooks.onStop(() => replServer.close());

  if (callback) callback(replServer);

  return new Promise((resolve) => {
    replServer.on('exit', () => {
      debug('exit');
      resolve();
    });
  });
};
