import { Reporter } from "./Reporter";

// export this way for types to be happy
export { repl } from "./repl";

// we need to use module.exports for Jest to be happy
import { repl } from "./repl";
const mainExport = Reporter;
(mainExport as any).repl = repl;

module.exports = mainExport;
