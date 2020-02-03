import { logger } from "@qawolf/logger";
import { bold } from "kleur";
import { start } from "repl";
const { addAwaitOutsideToReplServer } = require("await-outside");

export const pause = (context: any = {}) => {
  logger.debug("pause: start repl");
  console.log(
    bold().yellow("The test is paused. Type resume() below to continue.")
  );

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
    logger.debug("pause: exit repl");
    resolve();
  });

  replServer.context.resume = () => replServer.close();

  return promise;
};
