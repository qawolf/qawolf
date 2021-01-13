#!/usr/bin/env node

const { createServer } = require('http');
const handler = require('serve-handler');
const { join } = require('path');

const buildDir = join(__dirname, '../build');

const server = createServer((request, response) =>
  handler(request, response, {
    public: buildDir,
    rewrites: [{ source: '!fixtures/**', destination: '/index.html' }],
  }),
);

server.listen(5000, () => {
  console.log(`serve ${buildDir}`);
});
