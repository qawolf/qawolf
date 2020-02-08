import { logger } from "@qawolf/logger";
import { bold } from "kleur";
import { start, REPLServer } from "repl";
import "./await-outside";
import { addAwaitOutsideToReplServer } from "await-outside";
import { replRegistry } from "./replRegistry";

export const repl = (
  context: any = {},
  onReplCreated?: (replServer: REPLServer) => void
) => {
  logger.debug("repl: start");
  console.log(
    bold().yellow("Type .exit to close the repl and continue running your code")
  );

  let resolve: () => void;
  const promise = new Promise(r => (resolve = r));

  const replServer = start({
    terminal: true,
    useGlobal: true
  });

  addAwaitOutsideToReplServer(replServer);

  const registryContext = replRegistry.getContext();

  Object.keys(registryContext).forEach(key => {
    replServer.context[key] = registryContext[key];
  });

  Object.keys(context).forEach(key => {
    replServer.context[key] = context[key];
  });

  replServer.on("exit", () => {
    logger.debug("repl: exit");
    resolve();
  });

  if (onReplCreated) {
    onReplCreated(replServer);
  }

  return promise;
};
