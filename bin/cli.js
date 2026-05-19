#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';
import detective from '../index.js';

const filename = process.argv[2];

if (!filename) {
  console.log('Filename not supplied');
  console.error('Usage: detective-amd <filename>');
  process.exit(1);
}

const dependencies = detective(fs.readFileSync(filename, 'utf8'));
for (const dependency of dependencies) {
  console.log(dependency);
}
