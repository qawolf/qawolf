const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  name: "@qawolf/jest-environment",
  displayName: "@qawolf/jest-environment",
  testEnvironment: "./lib/index.js",
  setupFilesAfterEnv: ["./setup.ts"]
};
