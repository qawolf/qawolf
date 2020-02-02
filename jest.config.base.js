module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testRegex: "(/tests/.*.(test|spec)).(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  testTimeout: 60000,
  verbose: true
};
