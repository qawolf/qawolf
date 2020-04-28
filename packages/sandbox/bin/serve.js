#!/usr/bin/env node

const { execSync } = require('child_process');
const { join } = require('path');

const buildDir = join(__dirname, '../build');

const command = `serve ${buildDir}`;
console.log(command);

execSync(command, { stdio: 'inherit' });
