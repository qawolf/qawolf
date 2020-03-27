declare module 'await-outside' {
  import { REPLServer } from 'repl';

  export function addAwaitOutsideToReplServer(repl: REPLServer): void;
}
