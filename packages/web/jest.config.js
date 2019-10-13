const base = require("../../jest.config.base.js");

module.exports = {
  ...base,
  // tests use page.evaluate so we cannot collect coverage
  collectCoverage: false,
  name: "@qawolf/web",
  displayName: "@qawolf/web"
};
