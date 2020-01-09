const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  // this project has no src and windows has a bug where it
  // will not find the other tests if any rootDir is missing
  roots: ["<rootDir>/tests"],
  // prevent errors with page.evaluate
  collectCoverage: false,
  displayName: "@qawolf/web-tests",
  name: "@qawolf/web-tests"
};
