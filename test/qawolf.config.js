module.exports = {
  attribute: 'id,data-testid',
  createTemplate: ({ name, url }) => `test,${name},${url}`,
  rootDir: 'mytests',
  testTimeout: 120000,
};
