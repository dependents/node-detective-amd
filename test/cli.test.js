'use strict';

const assert = require('assert').strict;
const process = require('process');
const { spawnSync } = require('child_process');
const path = require('path');
const { suite } = require('uvu');

const cliPath = path.resolve(__dirname, '..', 'bin', 'cli.js');
const test = suite('detective-amd CLI');

test('prints usage to stderr and exits 1 when filename is missing', () => {
  const result = spawnSync(process.execPath, [cliPath], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: detective-amd <filename>/);
});

test('prints dependencies to stdout and exits 0 for a valid AMD file', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures', 'amd', 'driver.js');
  const result = spawnSync(process.execPath, [cliPath, fixturePath], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /\.\/a/);
});

test('prints nothing to stdout for an AMD file with no dependencies', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures', 'amd', 'nodep.js');
  const result = spawnSync(process.execPath, [cliPath, fixturePath], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), '');
});

test.run();
