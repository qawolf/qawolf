module.exports = {
  attribute: 'id,data-testid',
  createScriptTemplate: ({ name, url }) => `script,${name},${url}`,
  createTestTemplate: ({ name, url }) => `test,${name},${url}`,
  rootDir: 'mytests',
};
