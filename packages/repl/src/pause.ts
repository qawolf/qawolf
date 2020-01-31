import { start } from "repl";
const { addAwaitOutsideToReplServer } = require("await-outside");

export const pause = (context: any = {}) => {
  console.log("repl: open");

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
    console.log("replServer: close");
    resolve();
  });

  replServer.context.resume = () => replServer.close();

  return promise;
};
