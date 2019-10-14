const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  name: "@qawolf/jest-tests",
  displayName: "@qawolf/jest-tests",
  testEnvironment: "@qawolf/jest-environment",
  setupFilesAfterEnv: ["./setup.ts"]
};
