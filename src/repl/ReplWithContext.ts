import { logger } from "@qawolf/logger";
import { Callback } from "@qawolf/types";
import "./await-outside";
import { addAwaitOutsideToReplServer } from "await-outside";
import { bold } from "kleur";
import { start, REPLServer } from "repl";
import { CONTEXT } from "./Context";

export class ReplWithContext {
  private _server: REPLServer;

  constructor() {
    logger.debug("Repl: construct");
    console.log(
      bold().yellow(
        "Type .exit to close the repl and continue running your code"
      )
    );

    this._server = start({
      terminal: true,
      useGlobal: true
    });

    addAwaitOutsideToReplServer(this._server);

    this.includeContext(CONTEXT.context());

    CONTEXT.onChange(() => {
      this.includeContext(CONTEXT.context());
    });
  }

  includeContext(context: any) {
    Object.keys(context).forEach(key => {
      this._server.context[key] = context[key];
    });
  }

  close() {
    this._server.close();
  }

  on(event: string, callback: Callback) {
    this._server.on(event, callback);
  }
}

export const repl = (
  context?: any,
  onCreated?: (repl: ReplWithContext) => void
) => {
  let resolve: () => void;

  const promise = new Promise(r => (resolve = r));

  const repl = new ReplWithContext();

  if (context) {
    repl.includeContext(context);
  }

  if (onCreated) {
    onCreated(repl);
  }

  repl.on("exit", () => {
    logger.debug("repl: exit");
    resolve();
  });

  return promise;
};
