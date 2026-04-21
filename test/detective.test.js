'use strict';

const assert = require('assert').strict;
const { readFile } = require('fs/promises');
const path = require('path');
const { suite } = require('uvu');
const detective = require('../index.js');
const { ast } = require('./fixtures/ast.js');

async function getDepsOf(filepath, options) {
  const src = await readFile(path.resolve(__dirname, filepath), 'utf8');
  return detective(src, options);
}

const test = suite('detective-amd');

test('accepts an AST', () => {
  const deps = detective(ast);
  assert.equal(deps.length, 0);
});

test('supports es6', () => {
  assert.doesNotThrow(() => {
    detective('define({ foo() {}});');
  });
});

test('supports jsx', () => {
  assert.doesNotThrow(() => {
    detective('define({ foo: function(){ return <jsx />; } });');
  });
});

test('returns an empty list on an empty file', () => {
  const results = detective('');
  assert.equal(results.length, 0);
});

test('throws if the source content is not given', () => {
  assert.throws(() => {
    detective();
  }, /^Error: src not given$/);
});

test('returns the dependencies of the factory form', async() => {
  const deps = await getDepsOf('./fixtures/amd/factory.js');
  assert.equal(deps.length, 2);
  assert.equal(deps[0], './b');
  assert.equal(deps[1], './c');
});

test('returns an empty list for the no dependency form', async() => {
  const deps = await getDepsOf('./fixtures/amd/nodep.js');
  assert.equal(deps.length, 0);
});

test('returns the dependencies of the named form', async() => {
  const deps = await getDepsOf('./fixtures/amd/named.js');
  assert.equal(deps.length, 1);
  assert.equal(deps[0], 'a');
});

test('returns the dependencies of the dependency form', async() => {
  const deps = await getDepsOf('./fixtures/amd/dep.js');
  assert.equal(deps.length, 2);
  assert.equal(deps[0], './a');
  assert.equal(deps[1], './b');
});

test('returns the dependencies for the REM form (#2)', async() => {
  const deps = await getDepsOf('./fixtures/amd/rem.js');
  assert.equal(deps.length, 2);
  assert.equal(deps[0], 'a');
  assert.equal(deps[1], 'b');
});

test('returns the emtpy list for non-amd modules', async() => {
  const deps = await getDepsOf('./fixtures/amd/empty.js');
  assert.equal(deps.length, 0);
});

test('returns the dependencies of a driver script', async() => {
  const deps = await getDepsOf('./fixtures/amd/driver.js');
  assert.equal(deps.length, 1);
  assert.equal(deps[0], './a');
});

test('includes dynamic requires as dependencies', async() => {
  const deps = await getDepsOf('./fixtures/amd/dynamicRequire.js');
  assert.equal(deps.length, 2);
  assert.equal(deps[0], './a');
  assert.equal(deps[1], './b');
});

test('handles nested driver scripts', async() => {
  const deps = await getDepsOf('./fixtures/amd/IIFEWithDriver.js');
  assert.equal(deps.length, 2);
  assert.equal(deps[0], 'a');
  assert.equal(deps[1], 'b');
});

test('skips dynamic computed dependencies', async() => {
  const deps = await getDepsOf('./fixtures/amd/dynamicComputedRequire.js');
  assert.equal(deps.length, 1);
  assert.equal(deps[0], './a');
});

test('skips scalar computed require (does not emit empty string)', async() => {
  const deps = await getDepsOf('./fixtures/amd/dynamicScalarComputedRequire.js');
  assert.equal(deps.length, 1);
  assert.equal(deps[0], './a');
});

test('does not mistakenly try to parse generic defines as amd', async() => {
  const deps = await getDepsOf('./fixtures/notAmd.js');
  assert.equal(deps.length, 0);
});

test('when given option to omit lazy loaded requires, does not include them in the list of dependencies', async() => {
  const deps = await getDepsOf('./fixtures/amd/dynamicRequire.js', {
    skipLazyLoaded: true
  });

  assert.equal(deps.length, 1);
  assert.equal(deps[0], './a');
});

test('when given option to omit lazy loaded requires, still returns the inner dependencies of an REM-form module', async() => {
  const deps = await getDepsOf('./fixtures/amd/rem.js', {
    skipLazyLoaded: true
  });

  assert.equal(deps.length, 2);
  assert.equal(deps[0], 'a');
  assert.equal(deps[1], 'b');
});

test('when given option to omit lazy loaded requires, still returns static deps of the named form', async() => {
  const deps = await getDepsOf('./fixtures/amd/named.js', { skipLazyLoaded: true });
  assert.equal(deps.length, 1);
  assert.equal(deps[0], 'a');
});

test('handles dynamic require whose argument is an identifier (non-literal, non-call-expression)', () => {
  const deps = detective('define(function(require) { require(someIdentifier); });');
  assert.equal(deps.length, 1);
  assert.equal(deps[0], 'someIdentifier');
});

test('does not throw when a require call inside AMD has no arguments', () => {
  assert.doesNotThrow(() => {
    detective('define(function(require) { require(); });');
  });
});

test.run();
