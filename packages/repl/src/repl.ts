import { logger } from "@qawolf/logger";
import { bold } from "kleur";
import { start } from "repl";
const { addAwaitOutsideToReplServer } = require("await-outside");

export const repl = (context: any = {}) => {
  logger.debug("repl: start");
  console.log(bold().yellow("Type .exit or resume() to close the repl"));

  let resolve: () => void;
  const promise = new Promise(r => (resolve = r));

  const replServer = start({
    terminal: true,
    useGlobal: true
  });

  addAwaitOutsideToReplServer(replServer);

  Object.keys(context).forEach(key => {
    replServer.context[key] = context[key];
  });

  replServer.on("exit", () => {
    logger.debug("repl: exit");
    resolve();
  });

  replServer.context.resume = () => replServer.close();

  return promise;
};
