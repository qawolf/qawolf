const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  name: "@qawolf/browser",
  displayName: "@qawolf/browser",
  // prevent errors with page.evaluate
  collectCoverage: false
};
