const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  // prevent errors with page.evaluate
  collectCoverage: false,
  displayName: "@qawolf/web-tests",
  name: "@qawolf/web-tests"
};
