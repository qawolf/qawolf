module.exports = {
  globalSetup: "./test/setup/setup-global.js",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["./test/setup/setup-each.js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist"],
  testRegex: "(/test/.*.(test|spec)).(jsx?|tsx?)$",
  testTimeout: 60000,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
