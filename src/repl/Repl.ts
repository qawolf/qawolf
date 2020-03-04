import './await-outside';
import { addAwaitOutsideToReplServer } from 'await-outside';
import Debug from 'debug';
import { bold } from 'kleur';
import { start, REPLServer } from 'repl';
import { CONTEXT } from './ReplContext';
import { Callback } from '../types';

const debug = Debug('qawolf:repl');

export class Repl {
  private _server: REPLServer;

  constructor() {
    debug('construct');

    console.log(
      bold().yellow(
        'Type .exit to close the repl and continue running your code',
      ),
    );

    this._server = start({
      terminal: true,
      useGlobal: true,
    });

    addAwaitOutsideToReplServer(this._server);

    this.includeContext(CONTEXT.context());

    CONTEXT.onChange(() => {
      this.includeContext(CONTEXT.context());
    });
  }

  includeContext(context: any): void {
    Object.keys(context).forEach(key => {
      this._server.context[key] = context[key];
    });
  }

  close(): void {
    this._server.close();
  }

  on(event: string, callback: Callback): void {
    this._server.on(event, callback);
  }
}

export const repl = (
  context?: any,
  onCreated?: (repl: Repl) => void,
): Promise<void> => {
  let resolve: () => void;

  const promise = new Promise<void>(r => (resolve = r));

  const repl = new Repl();

  if (context) {
    repl.includeContext(context);
  }

  if (onCreated) {
    onCreated(repl);
  }

  repl.on('exit', () => {
    debug('exit');
    resolve();
  });

  return promise;
};
