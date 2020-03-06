module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['./test/e2e'],
  testRegex: '(/test/.*.(test|spec)).(jsx?|tsx?)$',
  testTimeout: 30000,
};
