// setup fail-fast since we do not want to continue when a step fails
// hopefully jest-circus implements this behavior, but was not the case when I tested jest 24.9.0
// https://github.com/facebook/jest/issues/2867#issuecomment-476647864
// https://github.com/facebook/jest/issues/6527#issuecomment-506278251

// require since there are no types
const failFast = require("@qawolf/jasmine-fail-fast");
const jasmineEnv = (jasmine as any).getEnv();
jasmineEnv.addReporter(failFast.init());
