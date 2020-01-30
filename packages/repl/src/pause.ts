import { start } from "repl";
const { addAwaitOutsideToReplServer } = require("await-outside");

export const pause = (context: any = {}) => {
  console.log("start repl");

  const repl = start({
    terminal: true,
    useGlobal: true
  });

  addAwaitOutsideToReplServer(repl);

  Object.keys(context).forEach(key => {
    repl.context[key] = context[key];
  });

  return new Promise(resolve => {
    repl.context.resume = () => {
      repl.close();
      resolve();
    };
  });
};
