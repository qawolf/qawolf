import { Reporter } from "./Reporter";

// export this way for types to be happy
export { repl } from "./repl";
export { replRegistry } from "./replRegistry";

import { repl } from "./repl";
import { replRegistry } from "./replRegistry";

// we need to use module.exports for Jest to be happy
const mainExport = Reporter as any;

mainExport.repl = repl;
mainExport.replRegistry = replRegistry;

module.exports = mainExport;
