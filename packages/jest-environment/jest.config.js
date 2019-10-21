const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  displayName: "@qawolf/jest-environment",
  name: "@qawolf/jest-environment",
  // needed to injest types
  setupFilesAfterEnv: ["./src/setup.ts"],
  testEnvironment: "./lib/index.js"
};
