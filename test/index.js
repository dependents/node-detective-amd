/* eslint-env mocha */

'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const detective = require('../index.js');

function getDepsOf(filepath, options) {
  const src = fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');
  return detective(src, options);
}

const amdAST = {
  type: 'Program',
  body: [{
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'define'
      },
      arguments: [
        {
          type: 'ArrayExpression',
          elements: []
        },
        {
          type: 'FunctionExpression',
          id: null,
          params: [],
          defaults: [],
          body: {
            type: 'BlockStatement',
            body: []
          },
          rest: null,
          generator: false,
          expression: false
        }
      ]
    }
  }]
};

describe('detective-amd', () => {
  it('accepts an AST', () => {
    const deps = detective(amdAST);
    assert.equal(deps.length, 0);
  });

  it('supports es6', () => {
    assert.doesNotThrow(() => {
      detective('define({ foo() {}});');
    });
  });

  it('supports jsx', () => {
    assert.doesNotThrow(() => {
      detective('define({ foo: function(){ return <jsx />; } });');
    });
  });

  it('returns and empty list on an empty file', () => {
    const results = detective('');
    assert.equal(results.length, 0);
  });

  it('throws if the source content is not given', () => {
    assert.throws(() => {
      detective();
    });
  });

  it('returns the dependencies of the factory form', () => {
    const deps = getDepsOf('./fixtures/amd/factory.js');
    assert.equal(deps.length, 2);
    assert.equal(deps[0], './b');
    assert.equal(deps[1], './c');
  });

  it('returns the an empty list for the no dependency form', () => {
    const deps = getDepsOf('./fixtures/amd/nodep.js');
    assert.equal(deps.length, 0);
  });

  it('returns the dependencies of the named form', () => {
    const deps = getDepsOf('./fixtures/amd/named.js');
    assert.equal(deps.length, 1);
    assert.equal(deps[0], 'a');
  });

  it('returns the dependencies of the dependency form', () => {
    const deps = getDepsOf('./fixtures/amd/dep.js');
    assert.equal(deps.length, 2);
    assert.equal(deps[0], './a');
    assert.equal(deps[1], './b');
  });

  it('returns the dependencies for the REM form (#2)', () => {
    const deps = getDepsOf('./fixtures/amd/rem.js');
    assert.equal(deps.length, 2);
    assert.equal(deps[0], 'a');
    assert.equal(deps[1], 'b');
  });

  it('returns the emtpy list for non-amd modules', () => {
    const deps = getDepsOf('./fixtures/amd/empty.js');
    assert.equal(deps.length, 0);
  });

  it('returns the dependencies of a driver script', () => {
    const deps = getDepsOf('./fixtures/amd/driver.js');
    assert.equal(deps.length, 1);
    assert.equal(deps[0], './a');
  });

  it('includes dynamic requires as dependencies', () => {
    const deps = getDepsOf('./fixtures/amd/dynamicRequire.js');
    assert.equal(deps.length, 2);
    assert.equal(deps[0], './a');
    assert.equal(deps[1], './b');
  });

  it('handles nested driver scripts', () => {
    const deps = getDepsOf('./fixtures/amd/IIFEWithDriver.js');
    assert.equal(deps.length, 2);
    assert.equal(deps[0], 'a');
    assert.equal(deps[1], 'b');
  });

  it('skips dynamic computed dependencies', () => {
    const deps = getDepsOf('./fixtures/amd/dynamicComputedRequire.js');
    assert.equal(deps.length, 1);
    assert.equal(deps[0], './a');
  });

  it('does not mistakenly try to parse generic defines as amd', () => {
    const deps = getDepsOf('./fixtures/notAmd.js');
    assert.equal(deps.length, 0);
  });

  describe('when given the option to omit lazy loaded requires', () => {
    it('does not include them in the list of dependencies', () => {
      const deps = getDepsOf('./fixtures/amd/dynamicRequire.js', {
        skipLazyLoaded: true
      });

      assert.equal(deps.length, 1);
      assert.equal(deps[0], './a');
    });

    it('still returns the inner dependencies of an REM-form module', () => {
      const deps = getDepsOf('./fixtures/amd/rem.js', {
        skipLazyLoaded: true
      });

      assert.equal(deps.length, 2);
      assert.equal(deps[0], 'a');
      assert.equal(deps[1], 'b');
    });
  });
});
