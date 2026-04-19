#!/usr/bin/env node

'use strict';

const fs = require('fs');
const process = require('process');
const getDependencies = require('../index.js');

const filename = process.argv[2];

if (!filename) {
  console.log('Filename not supplied');
  console.error('Usage: detective-amd <filename>');
  process.exit(1);
}

const dependencies = getDependencies(fs.readFileSync(filename, 'utf8'));
for (const dependency of dependencies) {
  console.log(dependency);
}
