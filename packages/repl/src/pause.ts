import { start } from "repl";

export const pause = (context: any = {}) => {
  console.log("start repl");

  const server = start({
    prompt: "qawolf > ",
    terminal: true,
    useGlobal: true
  });

  Object.keys(context).forEach(key => {
    server.context[key] = context[key];
  });

  return new Promise(resolve => {
    server.context.resume = () => {
      server.close();
      resolve();
    };
  });
};
