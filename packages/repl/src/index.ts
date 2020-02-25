import { Reporter } from "./Reporter";

// export for types to be happy
export { repl, ReplWithContext } from "./ReplWithContext";
export { CONTEXT } from "./Context";

import { repl } from "./ReplWithContext";
import { CONTEXT } from "./Context";

// export with module.exports for Jest to be happy
const mainExport = Reporter as any;
mainExport.CONTEXT = CONTEXT;
mainExport.repl = repl;
module.exports = mainExport;
