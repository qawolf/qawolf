import { Reporter } from "./Reporter";

// export for types to be happy
export { repl, ReplWithContext } from "./ReplWithContext";
export { registry } from "./Registry";

import { repl } from "./ReplWithContext";
import { registry } from "./Registry";

// export with module.exports for Jest to be happy
const mainExport = Reporter as any;
mainExport.repl = repl;
mainExport.registry = registry;
module.exports = mainExport;
