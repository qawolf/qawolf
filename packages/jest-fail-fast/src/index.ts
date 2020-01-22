// setup fail-fast since we do not want to continue when a step fails
// hopefully jest-circus implements this behavior, but was not the case when I tested jest 24.9.0
// https://github.com/facebook/jest/issues/2867#issuecomment-476647864
// https://github.com/facebook/jest/issues/6527#issuecomment-506278251

type Callback = (name: string) => void;

const j = jasmine as any;

// require since there are no types
const failFast = require("@qawolf/jasmine-fail-fast");
const jasmineEnv = j.getEnv();
jasmineEnv.addReporter(failFast.init());

// use Jasmine specStarted reporter until we can use Jest Circus
// https://github.com/qawolf/qawolf/issues/345
j.qaw_callbacks = [];

j.qaw_onSpecStarted = (callback: Callback) => j.qaw_callbacks.push(callback);

jasmineEnv.addReporter({
  specStarted: (result: any) => {
    j.qaw_callbacks.forEach((cb: Callback) => cb(result.description));
  }
});
